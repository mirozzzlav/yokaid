import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './upload.css';
import config from 'src/config';
import useCall from 'src/hooks/useCall';

const getSize = (value) => {
  if (!value) {
    return null;
  }

  const sizeRegex = /(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/;
  const matches = value.toString().match(sizeRegex);

  if (!matches) {
    return value;
  }

  const [numericPart, unit] = matches;
  const numericValue = parseFloat(numericPart);

  switch (unit.toLowerCase()) {
    case 'gb':
    case 'g':
      return numericValue * 1024 * 1024 * 1024;
    case 'mb':
    case 'm':
      return numericValue * 1024 * 1024;
    case 'kb':
    case 'k':
      return numericValue * 1024;
    default:
      return null;
  }
};

const slugify = (filename) => {
  const ext = filename.match(/\.\w+$/gm);

  let fl = filename.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  fl = `${fl
    .replace(/\.\w+$/gm, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')}`;

  return fl.toLowerCase() + ext;
};

const UploadStates = {
  running: 'running',
  cancelled: 'cancelled',
  finished: 'finished',
};

function useDeleteMedia(onCallFinish) {
  const { call } = useCall(onCallFinish);
  return (mediaFolderId, mediaId) =>
    call(config.api.endPointsURLs.deleteMedia, [mediaFolderId, mediaId]);
}

export default function Upload({
  autoUpload,
  label,
  extensions,
  removeProgressbar,
  size,
  success,
  url,
  onFilesChange,
  onFileDelete,
  forceReset,
}) {
  let instances = [];
  let uploadContainer = null;
  let uploadSessionId = null;
  const deleteMediaCall = useDeleteMedia(onFileDelete);

  const getInstance = (uploadId) =>
    instances.find(
      ({ uploadId: currentUploadId }) => currentUploadId === uploadId,
    ) || null;

  const showMessage = (val) => {
    const msgBox = document.querySelector('.messagebox');
    msgBox.style.display = 'block';
    msgBox.innerHTML = val.replace(/\n/, '<br />');
  };

  const hideMessage = () => {
    document.querySelector('.messagebox').style.display = 'none';
  };

  const getInstancesCount = () =>
    instances.filter(({ state }) => state !== UploadStates.cancelled).length;

  const generateUploadId = () =>
    `${uploadSessionId}_${
      new Date().getTime() + Math.round(Math.random() * 256) - uploadSessionId
    }`;

  const getUploadIdPartials = (uploadId) => uploadId.split('_');

  const removeInstance = (uploadId) => {
    let newInstances = [];
    instances.forEach((instance) => {
      if (instance.uploadId !== uploadId) {
        newInstances = [...newInstances, instance];
      } else {
        instance.element.remove();
        deleteMediaCall(...getUploadIdPartials(uploadId));
      }
    });
    instances = newInstances;
    onFilesChange(uploadSessionId, getInstancesCount());
  };

  const cancel = (uploadId) => {
    let newInstances = [];
    instances.forEach((instance) => {
      if (instance.uploadId === uploadId) {
        instance.element.remove();
      }
      newInstances = [
        ...newInstances,
        {
          ...instance,
          state:
            uploadId === instance.uploadId
              ? UploadStates.cancelled
              : instance.state,
        },
      ];
    });
    instances = newInstances;
    onFilesChange(uploadSessionId, getInstancesCount());
  };

  const sliceUpload = (instance) => {
    const data = new FormData();
    const filename = slugify(instance.file.name);
    const { element } = instance;
    let responseOk = false;

    data.append(
      'file',
      instance.file.slice(instance.start, instance.end, {
        type: 'application/octet-stream',
      }),
    );
    data.append('type', 'multipart/form-data');
    return fetch(instance.url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'X-Upload-Id': instance?.uploadId || '',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
        'X-File-Name': filename,
        'X-Slice': instance.current.toString(),
        'X-Slices': instance.slices.toString(),
        'X-File-Size': instance.file.size.toString(),
        'X-Slice-Size': instance.end.toString(),
      },
      body: data,
    })
      .then((response) => {
        responseOk = response.ok;
        if (!response.headers.get('Content-Length')) {
          return { msg: 'server error' };
        }
        return response.json();
      })
      .then((response) => {
        const progressBar = element.querySelector('.progress');
        if (!responseOk) {
          throw Error(response.msg);
        }
        progressBar.style.width = `${instance.percentage}%`;
        return response.data.file || null;
      })
      .catch((e) => showMessage(e.message));
  };

  const fileUpload = async (sliceIndex, uploadId) => {
    const instance = getInstance(uploadId);
    if (
      sliceIndex >= instance.slices ||
      instance.state !== UploadStates.running
    ) {
      return;
    }
    const nextSlice = sliceIndex + 1;
    instance.current = nextSlice;
    instance.start = sliceIndex * instance.chunkSize;
    instance.end =
      nextSlice === instance.slices
        ? instance.file.size
        : nextSlice * instance.chunkSize;
    instance.percentage = +((100 / instance.slices) * nextSlice);
    const file = await sliceUpload(instance);
    if (file) {
      instance.state = UploadStates.finished;
      if (instance.removeProgressbar === true) {
        removeInstance(uploadId);
      }
      success(file);
    } else {
      await fileUpload(nextSlice, uploadId);
    }
  };

  const handleFiles = (upload, files) => {
    const chunkSize = +(1024 * 1024);
    Array.from(files).forEach(async (file) => {
      const uploadId = generateUploadId();
      const ext = file.name.split('.').pop().trim().toLowerCase() || null;
      const filesize = upload.size || 1099511627776;
      if (
        !upload.extensions.map((e) => e.toLowerCase()).includes(ext) ||
        file.size > filesize
      ) {
        showMessage('some of the files is in wrong format or oversize');
        return;
      }

      const li = document.createElement('LI');

      li.innerHTML = `
        <div class="li-top">
          <div class="filename">${file.name}</div>
          <div class="control">
            <div class="remove"></div>
          </div>
        </div>
        <div class="progress"></div>`;

      uploadContainer.querySelector('ul').appendChild(li);
      instances = [
        ...instances,
        {
          uploadId,
          file,
          element: li,
          slices: Math.ceil(file.size / chunkSize),
          current: null,
          state: UploadStates.running,
          chunkSize,
          url: upload.url,
          removeProgressbar: upload.removeProgressbar,
          success: upload.success,
        },
      ];

      li.onclick = (e) => {
        const cl = Array.from(e.target.classList);
        if (cl.includes('remove')) {
          if (getInstance(uploadId)?.state === UploadStates.finished) {
            removeInstance(uploadId);
          } else {
            cancel(uploadId);
          }
        }
      };
      if (upload.autoUpload === true) {
        await fileUpload(0, uploadId);
      } else {
        const btn = uploadContainer.querySelector('.uploadBtn');
        btn.style.display = 'block';
        btn.onclick = (e) => {
          instances.forEach(async ({ uploadId: currentUploadId }) => {
            await fileUpload(0, currentUploadId);
            e.preventDefault();
          });
          btn.style.display = 'none';
        };
      }
    });
  };

  const onFileInputChange = (e) => {
    hideMessage();
    handleFiles(
      {
        url,
        success,
        autoUpload,
        removeProgressbar,
        files: {},
        size: getSize(size),
        extensions:
          (extensions || null) !== null
            ? extensions.replace(/jpg/gi, 'jpg jpeg').trim().split(' ')
            : null,
      },
      e.target.files,
    );
    onFilesChange(uploadSessionId, getInstancesCount());
    e.preventDefault();
  };

  const attachListeners = () => {
    const fileInput = uploadContainer.querySelector('input[type=file]');
    const dropArea = fileInput.parentElement;
    fileInput.onchange = onFileInputChange;
    const removeHover = () => {
      dropArea.classList.remove();
      return false;
    };
    dropArea.ondragover = () => {
      dropArea.classList.add('hover');
      return false;
    };

    dropArea.ondragend = removeHover;
    dropArea.ondragleave = removeHover;
    dropArea.ondrop = () => removeHover;
  };

  const reset = () => {
    uploadContainer = document.querySelector('.fileUpload');
    uploadSessionId = new Date().getTime();
    hideMessage();
    uploadContainer.querySelector('ul').innerHTML = '';
    uploadContainer.querySelector('input[type=file]').value = '';
    instances = [];
    onFilesChange(uploadSessionId, 0);
    attachListeners();
  };

  useEffect(() => {
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
      throw Error("browser doesn't support advanced uploads");
    }
    reset();
  }, []);

  useEffect(() => {
    if (forceReset) {
      reset();
    }
  }, [forceReset]);

  return (
    <section className="fileUpload">
      <div className="dropArea">
        {label}
        <input type="file" multiple accept="" />
      </div>

      <ul />
      <div className="messagebox" />
      <hr />
      <div className="uploadBtn">Upload</div>
    </section>
  );
}

Upload.defaultProps = {
  removeProgressbar: false,
  autoUpload: true,
  size: 1024 * 1024 * 32,
  extensions: 'jpg gif webp png',
  label: 'Media upload',
  success: () => {},
  onFilesChange: () => {},
  onFileDelete: () => {},
};

Upload.prototype.propTypes = {
  url: PropTypes.string.isRequired,
  removeProgressbar: PropTypes.bool,
  autoUpload: PropTypes.bool,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  extensions: PropTypes.string,
  success: PropTypes.func,
  label: PropTypes.string,
  onFilesChange: PropTypes.func,
  onFileDelete: PropTypes.func,
  forceReset: PropTypes.bool.isRequired,
};
