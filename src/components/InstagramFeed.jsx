import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { InstagramEmbed } from 'react-social-media-embed';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const InstagramFeed = () => {
    // Placeholder URLs - REPLACE THESE with real post URLs from @codigocarnaval and @manuelsire_
    const posts = [
        'https://www.instagram.com/p/DRvAobKDPhB/?hl=es',
        'https://www.instagram.com/p/DRu8Ycojcl2/?hl=es',
        'https://www.instagram.com/p/DRsarU6DNFh/?hl=es&img_index=1',
        'https://www.instagram.com/p/DRuyC0Tjfp0/?hl=es',
        'https://www.instagram.com/p/DRuD249jdW3/?hl=es'
    ];

    return (
        <section className="instagram-feed-section">
            <div className="section-header">
                <h2><i className="fab fa-instagram"></i> Últimas Novedades</h2>
                <p>Sigue a <a href="https://www.instagram.com/codigocarnaval/" target="_blank" rel="noopener noreferrer">@codigocarnaval</a> y <a href="https://www.instagram.com/manuelsire_/" target="_blank" rel="noopener noreferrer">@manuelsire_</a></p>
            </div>

            <div className="instagram-carousel-container">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    loop={true}
                    pagination={{ clickable: true }}
                    navigation={true}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    className="instagram-swiper"
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                        },
                        1024: {
                            slidesPerView: 3,
                        },
                    }}
                >
                    {posts.map((url, index) => (
                        <SwiperSlide key={index} className="instagram-slide">
                            <div className="instagram-embed-wrapper">
                                <InstagramEmbed
                                    url={url}
                                    width="100%"
                                    captioned
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default InstagramFeed;
