    const ytdl = require('ytdl-core');
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegPath = require('ffmpeg-static');

    ffmpeg.setFfmpegPath(ffmpegPath);

    async function convertYouTubeVideo(youtubeUrl, outputPath, format = 'mp4') {
        try {
            const videoStream = ytdl(youtubeUrl, { quality: 'highestaudio' }); // Or 'highestvideo' for video + audio

            ffmpeg(videoStream)
                .toFormat(format)
                .on('error', (err) => {
                    console.error('Error during conversion:', err);
                })
                .on('end', () => {
                    console.log(`Conversion complete! File saved to: ${outputPath}`);
                })
                .save(outputPath);

        } catch (error) {
            console.error('Error downloading YouTube video:', error);
        }
    }

    // Example usage:
    const youtubeVideoUrl = 'YOUR_YOUTUBE_VIDEO_URL'; // Replace with the actual YouTube URL
    const outputFilePath = 'output.mp3'; // Or 'output.mp4' for video
    convertYouTubeVideo(youtubeVideoUrl, outputFilePath, 'mp3'); // Or 'mp4' for video