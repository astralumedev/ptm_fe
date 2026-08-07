'use client';

import React from 'react';
import { arizonaFlare } from '../fonts';



interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
    <section className="relative h-[25vh] w-full">
     
      {/* Content */}
      <div className="relative z-10 h-full rounded-2xl flex items-center justify-center px-8 md:px-16 mx-auto w-[85%]">
        <h1 className={`text-3xl md:text-5xl font-bold text-mall-brown ${arizonaFlare.className}`}>
          {title.toUpperCase()}
        </h1>
      </div>
      <div className="w-[90%] h-px bg-gradient-to-r from-transparent via-mall-accent-dark to-transparent" />

    </section>
  );
};

export default PageHeader;
