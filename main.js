const fileInput = document.querySelector("#imageFileInput"); // returns the first element that is a descendant of node that matches selectors.
const canvas = document.querySelector("#canvas");
const canvasCtx = canvas.getContext("2d");
const brightnessInput = document.querySelector("#brightness");
const saturationInput = document.querySelector("#saturation");
const blurInput = document.querySelector("#blur");
const inversionInput = document.querySelector("#inversion");

const settings = {};
let image = null;

function resetSettings() {
  settings.brightness = "100";
  settings.saturation = "100";
  settings.blur = "0";
  settings.inversion = "0";

  brightnessInput.value = settings.brightness;
  saturationInput.value = settings.saturation;
  blurInput.value = settings.blur;
  inversionInput.value = settings.inversion;
}

function updateSetting(key, value) {
  if (!image) return;

  settings[key] = value;
  renderImage();
}

function generateFilter() { // canvas filter mdn
  const { brightness, saturation, blur, inversion } = settings;

  return `brightness(${brightness}%) saturate(${saturation}%) blur(${blur}px) invert(${inversion}%)`;
}

function renderImage() {
  canvas.width = image.width;
  canvas.height = image.height;

  canvasCtx.filter = generateFilter(); // filter here is representation of all the image settings
  canvasCtx.drawImage(image, 0, 0); // next time google what canvas is and it's context
}

// TODO add undo and reset buttons
// TODO add container to store uploaded images with edit opportunities and to drag them later to canvas
// TODO normalise different resolutions of images
// TODO fix the problem with brightness - it becomes unchangable, if changed too much

brightnessInput.addEventListener("change", () =>
  updateSetting("brightness", brightnessInput.value)
);
saturationInput.addEventListener("change", () =>
  updateSetting("saturation", saturationInput.value)
);
blurInput.addEventListener("change", () =>
  updateSetting("blur", blurInput.value)
);
inversionInput.addEventListener("change", () =>
  updateSetting("inversion", inversionInput.value)
);

fileInput.addEventListener("change", () => {
  image = new Image();

  image.addEventListener("load", () => {
    resetSettings();
    renderImage();
  });

  console.log(URL.createObjectURL(fileInput.files[0]));

  image.src = URL.createObjectURL(fileInput.files[0]); // get the reference to the image
});

resetSettings();
