import useCall from 'src/hooks/useCall';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import config from 'src/config';
import useNavigateAction from 'src/hooks/useNavigateAction';
import { isInt } from 'src/helpers';
import { IntervalContext, UserIdContext } from 'src/providers';

export function useGetProfessional(onSearchFinish) {
  const call = useCall((response) => {
    if (!response.data) {
      onSearchFinish(null);
      return;
    }
    onSearchFinish({
      ...response.data,
      reviews: response.data.reviews.map((review) => ({
        ...review,
        images: review.images
          ? review.images.slice(0, config.maxReviewImages)
          : null,
      })),
    });
  });
  const { loadUserId } = useContext(UserIdContext);
  return useCallback(
    (professionalId) => {
      const userId = loadUserId();
      call(
        `${config.api.endPointsURLs.getProfessionalDetail}/${professionalId}${
          userId ? `/${userId}` : ''
        }`,
      );
    },
    [call],
  );
}

export default function useProfessionalDetail() {
  const [professionalDetail, setProfessionalDetail] = useState(null);
  const callGetProfessional = useGetProfessional(setProfessionalDetail);
  const { action, actionParams } = useNavigateAction();
  const { addSubscriber, removeSubscriber } = useContext(IntervalContext);

  useEffect(() => {
    if (!action) {
      removeSubscriber('callGetProfessional');
      setProfessionalDetail(null);
      return;
    }
    if (action === 'add-review' || action === 'professional-detail') {
      const professionalId = isInt(actionParams)
        ? parseInt(actionParams, 10)
        : null;

      if (professionalId) {
        addSubscriber('callGetProfessional', () =>
          callGetProfessional(professionalId),
        );
      }
    }
  }, [action, actionParams]);

  return [professionalDetail, setProfessionalDetail];
}
