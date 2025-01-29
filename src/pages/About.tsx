import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

function About() {
    return (
        <div>
            <div className="text-2xl text-center pt-8 border-t">
                <Title text1="ABOUT" text2="US" />
            </div>
            <div className="my-10 flex flex-col md:flex-row gap-16">
                <img className="w-full md:max-w-[450px]" src={assets.MusicStore} alt="About Us" />
                <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
                    <p>
                        PlayScale was born out of a passion for music and a desire to revolutionize the way people discover and shop for musical instruments. Our journey began with a simple idea: to create a platform where musicians of all levels can easily explore, discover, and purchase a wide range of instruments and accessories from the comfort of their homes.
                    </p>
                    <p>
                        Since our inception, we have been dedicated to curating a diverse selection of high-quality musical instruments and gear that cater to every musician's taste and needs. From classical instruments and modern recording equipment to accessories and essentials, we source our collections from trusted brands and suppliers worldwide.
                    </p>
                    <b className="text-gray-800">Our Mission</b>
                    <p>
                        Our mission at PlayScale is to empower musicians with choice, convenience, and confidence. We’re committed to delivering a seamless shopping experience that inspires creativity, from browsing and ordering to delivery and beyond.
                    </p>
                </div>
            </div>
            <div className="text-xl py-4">
                <Title text1="WHY" text2="CHOOSE US" />
            </div>
            <div className="flex flex-col md:flex-row text-sm mb-20">
                {[
                    {
                        title: 'Quality Assurance:',
                        content:
                            'We meticulously select and vet each product to ensure it meets our stringent quality standards.',
                    },
                    {
                        title: 'Convenience:',
                        content:
                            'With our user-friendly interface and hassle-free ordering process, shopping has never been easier.',
                    },
                    {
                        title: 'Exceptional Customer Service:',
                        content:
                            'Our team of dedicated professionals is here to assist you the way, ensuring your satisfaction is our top priority.',
                    },
                ].map((item, index) => (
                    <div key={index} className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
                        <b>{item.title}</b>
                        <p className="text-gray-600">{item.content}</p>
                    </div>
                ))}
            </div>
            <NewsletterBox />
        </div>
    );
}

export default About;
