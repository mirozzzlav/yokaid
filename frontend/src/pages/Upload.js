import React from 'react'
import Upload from 'src/useUpload/useUpload.jsx'

function UploadTest () {
  const SuccessFunction = (response) => {
    console.log(response)
  }

  return (
    <>
      <Upload id={null} url={'/api/upload'} removeProgressbar={false} autoUpload={false} size={1024 * 1024 * 32} extensions={'jpg gif webp png'} success={SuccessFunction}>Image upload: Max 32mb</Upload>
    </>
  )
}

export default UploadTest
