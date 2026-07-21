import { FC } from 'react';

interface IconUploadProps {
    className?: string;
}

const IconUpload: FC<IconUploadProps> = ({ className }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                d="M12 15L12 2M12 2L15 5.5M12 2L9 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16C2 15.4477 2.44772 15 3 15C3.55228 15 4 15.4477 4 16C4 17.8856 4 19.0711 4.87868 19.9497C5.75736 20.8284 6.94285 20.8284 8.8 20.8284H15.2C17.0571 20.8284 18.2426 20.8284 19.1213 19.9497C20 19.0711 20 17.8856 20 16C20 15.4477 20.4477 15 21 15C21.5523 15 22 15.4477 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
        </svg>
    );
};

export default IconUpload;
