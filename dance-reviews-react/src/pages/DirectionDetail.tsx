
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DirectionHero from '@/components/DirectionHero';
import DirectionGallery from '@/components/DirectionGallery';
import DirectionTeam from '@/components/DirectionTeam';

const directionsData = {
  ballet: {
    title: 'БАЛЕТ - МОЯ МЕЧТА',
    subtitle: 'ТАНЦУЙ С НАМИ',
    description: 'Балет — вид искусства, где выразительные движения тела являются главным художественным средством. Как и другие виды искусства, балет отражает социальные аспекты жизни человека, его взаимоотношения с обществом, миром природы, другими людьми.',
    heroImage: '/images/landing-1-img-1.jpg.png',
    accentColor: 'bg-rose-100',
    galleries: [
      '/images/landing-1-img-1.jpg.png',
      '/images/image 3.png',
      '/images/image 2.png',
      '/images/im.png',
      '/images/Container (4).png',
      '/images/port-1-img-7-550x550.jpg.png'
    ]
  },
  latin: {
    title: 'ЛАТИНА - МОЙ РИТМ',
    subtitle: 'ТАНЦУЙ С НАМИ',
    description: 'Латиноамериканские танцы — это зажигательные ритмичные танцы, родиной которых считаются страны Латинской Америки. Они исполняются в паре и включают в себя самбу, ча-ча-ча, румбу, пасодобль и джайв.',
    heroImage: '/images/image 14.png',
    accentColor: 'bg-rose-100',
    galleries: [
      '/images/image 13.png',
      '/images/image 14.png',
      '/images/original_57dfec1a40c088044b8c66c9_60af3ec5554ac.avif',
      '/images/i.webp',
      '/images/blog-6-img-3.jpg.png',
      '/images/латина.png',
    ]
  },
  contemporary: {
    title: 'ТАНЕЦ - МОЯ ЖИЗНЬ',
    subtitle: 'ТАНЦУЙ С НАМИ',
    description: 'Современный танец — это танец, который исполняется для личного удовлетворения и самовыражения в отличие от более формальных социальных, соревновательных или сценических танцев. Современные танцы включают в себя множество направлений, от контемпорари до хип-хопа.',
    heroImage: '/images/Link.png',
    accentColor: 'bg-rose-100',
    galleries: [
      '/images/Link.png',
      '/images/danse.png',
      '/images/scale_1200.png',
      '/images/Уличный Танец.png',
      '/images/photo-1508700929628-666bc8bd84ea.avif',
      '/images/photo-1550026593-f369f98df0af.avif'
    ]
  },
  kids: {
    title: 'ДЕТСКИЕ ТАНЦЫ - РАДОСТЬ ДВИЖЕНИЯ',
    subtitle: 'ТАНЦУЙ С НАМИ',
    description: 'Детские танцы — это не только весёлый и полезный досуг, но и отличный способ физического и творческого развития ребёнка. Занятия танцами улучшают координацию, гибкость, осанку и музыкальный слух, а также помогают ребёнку развить уверенность в себе.',
    heroImage: '/images/landing-1-img-6.jpg.png',
    accentColor: 'bg-rose-100',
    galleries: [
      '/images/landing-1-img-6.jpg.png',
      '/images/child.png',
      '/images/child2.png',
      '/images/child3.png',
      '/images/h3-img-2.jpg.png',
      '/images/h3-img-1.jpg.png'
    ]
  }
};

const DirectionDetail = () => {
  const { slug } = useParams();
  const [direction, setDirection] = useState<any>(null);
  
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Set direction data based on slug
    if (slug && directionsData[slug as keyof typeof directionsData]) {
      setDirection(directionsData[slug as keyof typeof directionsData]);
    }
  }, [slug]);

  if (!direction) {
    return (
      <>
        <Header />
        <div className="container-custom py-32 text-center">
          <h1 className="text-3xl">Направление не найдено</h1>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <main>
        <DirectionHero 
          title={direction.title}
          subtitle={direction.subtitle}
          description={direction.description}
          image={direction.heroImage}
          accentColor={direction.accentColor}
        />
        <DirectionGallery images={direction.galleries} />
        <DirectionTeam />
      </main>
      <Footer />
    </motion.div>
  );
};

export default DirectionDetail;
