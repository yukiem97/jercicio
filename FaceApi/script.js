const elVideo = document.getElementById('video');

navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);

const cargarCamera = () => {
  navigator.getMedia(
    {
      video: true,
      audio: false
    },
    stream => elVideo.srcObject = stream,
    console.error
  );
};

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
  faceapi.nets.ageGenderNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models')
]).then(cargarCamera);

elVideo.addEventListener('loadedmetadata', async () => {
  const canvas = faceapi.createCanvasFromMedia(elVideo);
  document.body.append(canvas);

  const displaySize = { width: elVideo.videoWidth, height: elVideo.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(elVideo)
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    resizedDetections.forEach(detection => {
      const box = detection.detection.box;
      new faceapi.draw.DrawBox(box, {
        label: Math.round(detection.age) + ' años ' + detection.gender
      }).draw(canvas);
    });
  });
});




