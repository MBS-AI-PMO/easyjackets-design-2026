import sharp from "sharp";
// import { createCanvas , loadImage } from "canvas";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const addWatermark = async (file) => {
  const watermarkPath = __dirname + "/Header-logo.webp";
  // Load the watermark
  // const watermark = await loadImage(watermarkPath);

  // const baseImage = await loadImage(file.filepath);
  //   const baseWidth = baseImage.width;
  //   const baseHeight = baseImage.height;



  // const canvas = createCanvas(baseWidth, baseHeight);
  // const context = canvas.getContext('2d');

  // Background color (optional)
  // context.fillStyle = 'rgba(255, 255, 255, 0.1)'; 
  // context.fillRect(0, 0, baseWidth, baseHeight);

  // Add text
  // context.fillStyle = '#808080'; 
  // context.font = 'bold 50px Arial';
  // context.textAlign = 'center';
  // context.fillText('easyjackets.com', baseWidth / 2, baseHeight / 2);

  // Step 2: Convert canvas to a buffer
  // const buffer = canvas.toBuffer('image/webp');
  // Add watermark to the image
  const { width, height } = await sharp(file.filepath).metadata();

  const watermarkWithOpacity = await sharp(watermarkPath)
    .modulate({
      brightness: 1, // Keep brightness the same
      opacity: 0.03, // Set opacity to 50% (0.1 to 1.0 range)

    })
    .toBuffer();

  const resizedWatermark = await sharp(watermarkWithOpacity)
    .resize({
      width: Math.floor(width * 0.3), // Make the watermark 30% of the image width
      height: Math.floor(height * 0.3), // Adjust height proportionally (optional)
      fit: 'inside', // Ensure it fits within the dimensions
    })
    .toBuffer();



  const metadata = await sharp(resizedWatermark).metadata()

  const image = await sharp(file.filepath)
    .composite([{
      input: resizedWatermark,
      top: Math.round((height - metadata.height) / 2),
      left: Math.round(width - (metadata.width + (metadata.width / 2)))
    }]).toBuffer()


  // const image = await sharp(file.filepath)
  //   .composite([{ input: buffer}]).toBuffer()



  return image
  // Clean up uploaded file
  // fs.unlinkSync(file.path);
}

export default addWatermark
