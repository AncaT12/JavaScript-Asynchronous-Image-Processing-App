let startTime;

    async function fetchDogImage() {
        startTime = performance.now(); // Începutul măsurării timpului
        try {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            const data = await response.json();
            document.getElementById('jsonOutput').innerText = JSON.stringify(data, null, 2);
            recordTime('Fetch API');
            return data.message;
        } catch (error) {
            console.error('Error fetching dog image:', error);
        }
    }
    function mirrorImage(ctx, img) {
        const width = img.width;
        const height = img.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const mirroredImageData = ctx.createImageData(width, height);
    
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const originalPixelIndex = (y * width + x) * 4;
                const mirroredX = width - 1 - x;
                const mirroredPixelIndex = (y * width + mirroredX) * 4;
    
                for (let i = 0; i < 4; i++) { // Copierea valorilor RGBA
                    mirroredImageData.data[mirroredPixelIndex + i] = imageData.data[originalPixelIndex + i];
                }
            }
        }
    
        ctx.putImageData(mirroredImageData, width, 0);
    }
    function drawImageOnCanvas(imageUrl) {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.crossOrigin = 'anonymous';

        img.onload = function() {
            // Mărirea canvasului pentru a include atât imaginea originală, cât și cea procesată
            canvas.width = img.width * 3; // Triplăm lățimea pentru original, procesat și final
            canvas.height = img.height;

            // Desenarea imaginii originale în partea stângă
            ctx.drawImage(img, 0, 0);

            // Desenarea și procesarea imaginii în partea centrală
            mirrorImage(ctx, img);

            // Începerea procesării imaginii
            setTimeout(() => processImage(ctx, img, img.width, 0), 1000);
        };

        img.src = imageUrl;
    }
    


    function processImage(ctx, img, xStart, sliceIndex) {
        const slices = 4;
        const zoomFactor = 1;
        const sliceWidth = img.width * zoomFactor / slices;
        const sliceHeight = img.height * zoomFactor;

        if (sliceIndex >= slices) return;

        const x = xStart + sliceWidth * sliceIndex;

        // Desenarea și convertirea fiecărei felii la tonuri de gri
        ctx.drawImage(img, x / zoomFactor, 0, sliceWidth / zoomFactor, img.height, x, 0, sliceWidth, sliceHeight);
        convertToGrayscale(ctx, x, 0, sliceWidth, sliceHeight);

        recordTime(`Process Slice ${sliceIndex + 1}`);

        // Procesarea următoarei felii
        if (sliceIndex < slices - 1) {
            setTimeout(() => processImage(ctx, img, xStart, sliceIndex + 1), 1000);
        }
    }



    function convertToGrayscale(ctx, x, y, width, height) {
        const imageData = ctx.getImageData(x, y, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const luminosity = 0.21 * data[i] + 0.72 * data[i + 1] + 0.07 * data[i + 2]; // Calculul luminozității
            data[i] = luminosity;    // R
            data[i + 1] = luminosity; // G
            data[i + 2] = luminosity; // B
        }

        ctx.putImageData(imageData, x, y);
    }

    function recordTime(taskName) {
        const currentTime = performance.now();
        const duration = currentTime - startTime;
        document.getElementById('timingOutput').innerText += `${taskName}: ${duration.toFixed(2)} ms\n`;
        startTime = currentTime; // Resetarea timpului de start pentru următoarea măsurătoare
    }

    fetchDogImage().then(imageUrl => {
        drawImageOnCanvas(imageUrl);
    });