import { jsPDF } from "jspdf";
import JSZip from "jszip";

export const DEFAULT_SETTINGS = {
  fontFamily: "Playfair Display",
  fontSize: 48,
  fontWeight: "600",
  color: "#24315a",
  x: 50,
  y: 53,
};

export const FONT_OPTIONS = [
  "Playfair Display",
  "Montserrat",
  "DM Sans",
  "Great Vibes",
  "Georgia",
  "Times New Roman",
];

export function createDefaultTemplate(canvas) {
  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, width, height);

  // Outer border
  ctx.strokeStyle = "#c9a65d";
  ctx.lineWidth = 8;
  ctx.strokeRect(25, 25, width - 50, height - 50);

  // Inner border
  ctx.strokeStyle = "#e3d2a9";
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  ctx.textAlign = "center";

  ctx.fillStyle = "#a88642";
  ctx.font = "bold 20px Montserrat";
  ctx.fillText("CERTIFYHUB", width / 2, 120);

  ctx.fillStyle = "#253456";
  ctx.font = "bold 65px Georgia";
  ctx.fillText("CERTIFICATE", width / 2, 225);

  ctx.font = "24px Montserrat";
  ctx.fillStyle = "#8d774f";
  ctx.fillText("OF PARTICIPATION", width / 2, 270);

  ctx.fillStyle = "#64748b";
  ctx.font = "22px Montserrat";
  ctx.fillText(
    "This certificate is proudly presented to",
    width / 2,
    370
  );

  ctx.fillStyle = "#64748b";
  ctx.font = "21px Montserrat";
  ctx.fillText(
    "For their valuable participation and contribution",
    width / 2,
    560
  );

  ctx.fillText(
    "to our event. We appreciate your dedication.",
    width / 2,
    595
  );

  ctx.strokeStyle = "#c9a65d";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(160, 735);
  ctx.lineTo(430, 735);
  ctx.moveTo(570, 735);
  ctx.lineTo(840, 735);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = "18px Montserrat";
  ctx.fillText("DATE", 295, 770);
  ctx.fillText("AUTHORIZED SIGNATURE", 705, 770);
}

export async function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load template image."));

    image.src = source;
  });
}

function getFontString(settings, fontSize) {
  const family = settings.fontFamily.includes(" ")
    ? `"${settings.fontFamily}"`
    : settings.fontFamily;

  return `${settings.fontWeight} ${fontSize}px ${family}`;
}

export async function drawCertificate({
  canvas,
  template,
  name,
  settings,
}) {
  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  if (template) {
    const image = await loadImage(template);

    ctx.drawImage(image, 0, 0, width, height);
  } else {
    createDefaultTemplate(canvas);
  }

  await document.fonts.ready;

  ctx.fillStyle = settings.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Fit long participant names inside the certificate.
  let fontSize = settings.fontSize;

  ctx.font = getFontString(settings, fontSize);

  while (
    ctx.measureText(name).width > width * 0.85 &&
    fontSize > 18
  ) {
    fontSize -= 2;
    ctx.font = getFontString(settings, fontSize);
  }

  const x = (settings.x / 100) * width;
  const y = (settings.y / 100) * height;

  ctx.fillText(name, x, y, width * 0.9);
}

export async function createCertificatePDF({
  template,
  name,
  settings,
}) {
  const canvas = document.createElement("canvas");

  canvas.width = 1000;
  canvas.height = 707;

  await drawCertificate({
    canvas,
    template,
    name,
    settings,
  });

  const image = canvas.toDataURL("image/jpeg", 0.95);

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  pdf.addImage(image, "JPEG", 0, 0, 297, 210);

  return pdf;
}

function safeFileName(name) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 80) || "participant";
}

