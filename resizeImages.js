const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const resizeImage = async (req, res, next) => {
	// console.log(req.body.gal);
    const images = req.body.gal;
    const sizes = [
        { width: 200, height: 200, suffix: '200x200' },
        { width: 500, height: 500, suffix: '500x500' }
    ];

    for (const image of images) {
        const imagePath = path.join(__dirname, 'public', 'resurse', 'imagini', 'galerie', image.cale_imagine);
        for (const size of sizes) {
            const resizedImagePath = imagePath.replace(/(\.\w+)$/, `_${size.suffix}$1`);
            if (!fs.existsSync(resizedImagePath)) {
                await sharp(imagePath)
                    .resize(size.width, size.height)
                    .toFile(resizedImagePath);
            }
        }
    }
    next();
};

module.exports = resizeImage;