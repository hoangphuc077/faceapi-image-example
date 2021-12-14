const container = document.querySelector('#container');
const fileInput = document.querySelector('#fileInput');
var video = document.querySelector("#videoElement");
const canvas = document.querySelector('#canvas');

async function loadTrainingData(){
    const labels =['1', '2', '3', '4']
    const faceDescriptors = []
    for(const label of labels){
        const descriptors = []
        for(let i = 1; i<=4; i++){
            const image = await faceapi.fetchImage(`/data/${label}/${i}.jpeg`)
            const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
            descriptors.push(detection.descriptor)

        }   
        Toastify({
            text: `Train data succeed label ${label}`
        }).showToast();

        faceDescriptors.push(new faceapi.LabeledFaceDescriptors(label, descriptors))
     }
     return faceDescriptors
}
let faceMatcher
async function init(){


    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ])

    Toastify({
        text: 'Load model succeed'
    }).showToast();

    const trainingData = await loadTrainingData()
    console.log(trainingData)
    faceMatcher = new faceapi.FaceMatcher(trainingData, 0.6)

}
init()

async function videoDetection(){
    while(1){
        const size = {width: video.videoWidth, height: video.videoHeight}

        const image =   canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const canvas = await faceapi.createCanvasFromMedia(image)
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
        const resizeDetection = faceapi.resizeResults(detections, size)
        faceapi.draw.drawDetections(canvas, resizeDetection)
    }
}
videoDetection()
fileInput.addEventListener('change', async (e)=>{
    const file = fileInput.files[0];

    const image = await faceapi.bufferToImage(file)

    const canvas = await faceapi.createCanvasFromMedia(image)
    container.innerHTML = ''
    container.append(image)
    container.append(canvas)

    const size = {width: image.width, height: image.height}

    faceapi.matchDimensions(canvas, size)

    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

    const resizeDetection = faceapi.resizeResults(detections, size)

    // faceapi.draw.drawDetections(canvas, resizeDetection)
    for (const detection of resizeDetection){
        const box = detection.detection.box
        const drawBox = new faceapi.draw.DrawBox(box, {label: faceMatcher.findBestMatch(detection.descriptor)})
        drawBox.draw(canvas)
    }

    
})