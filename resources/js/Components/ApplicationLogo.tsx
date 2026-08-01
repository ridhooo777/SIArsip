import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/logo-piksi.png"
            alt="Politeknik Piksi Input Serang"
            {...props}
        />
    );
}
