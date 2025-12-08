import Lottie from 'lottie-react';
import theaterMasksAnimation from '../assets/animations/theater-masks.json';
import spotlightAnimation from '../assets/animations/spotlight.json';
import applauseAnimation from '../assets/animations/applause.json';

// Theater Masks - for headers and decorations
export const TheaterMasks = ({ style, loop = true }) => (
    <Lottie
        animationData={theaterMasksAnimation}
        loop={loop}
        style={{ width: 100, height: 100, ...style }}
    />
);

// Spotlight - for header glow effects
export const Spotlight = ({ style, loop = true }) => (
    <Lottie
        animationData={spotlightAnimation}
        loop={loop}
        style={{ width: 400, height: 100, ...style }}
    />
);

// Applause - for like button interactions
export const Applause = ({ style, loop = true, autoplay = true }) => (
    <Lottie
        animationData={applauseAnimation}
        loop={loop}
        autoplay={autoplay}
        style={{ width: 60, height: 60, ...style }}
    />
);

// Generic Lottie wrapper for custom animations
export const LottieAnimation = ({
    animationData,
    loop = true,
    autoplay = true,
    style = {},
    onComplete
}) => (
    <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={style}
        onComplete={onComplete}
    />
);

export default {
    TheaterMasks,
    Spotlight,
    Applause,
    LottieAnimation
};
