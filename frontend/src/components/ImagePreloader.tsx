import { useEffect } from 'react';

/**
 * List of images to preload for better user experience
 * These are secondary priority images that don't need HTML preload
 */
const SECONDARY_IMAGES = [
    '/tempImagejOecHH_1-removebg-preview.png',
    '/อัปโหลดใบเสร็จ.png',
    '/แลกรับของสมนาคุณ.png',
    '/ประวัติการเข้าร่วมกิจกรรม.png',
    '/ประวัติแลกรับ.png',
    '/ตรวจสอบรายชื่อ Top.png',
    '/Nav Bar.png',
];

/**
 * Preloads images by creating Image objects
 * This triggers the browser to download them without displaying
 */
const preloadImages = (imageUrls: string[]) => {
    imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
    });
};

/**
 * ImagePreloader Component
 * Preloads secondary images when the app mounts
 * This doesn't render anything - it's purely a utility component
 */
const ImagePreloader = () => {
    useEffect(() => {
        // Wait a bit before preloading to not block critical resources
        const timeoutId = setTimeout(() => {
            preloadImages(SECONDARY_IMAGES);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, []);

    return null;
};

export default ImagePreloader;
