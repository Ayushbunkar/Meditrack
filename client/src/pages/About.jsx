import React from "react";
import app from '../assets/app.png'; // Import an image for the about section

const About = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#0d0d0d] via-[#121212] to-[#1a1a1a] text-[#e5e5e5] px-6 sm:px-12 md:px-20 py-12">
      {/* Hero Section */}
      <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 text-center drop-shadow-lg">
        About MediTrack
      </h1>
      <p className="max-w-3xl text-lg sm:text-xl text-[#a1a1aa] text-center mb-10">
        MediTrack is your personal medicine reminder and health companion. Our
        mission is to help you never miss a dose, track your medicine history,
        and make your health journey easier. Built with modern technology and a
        user-first approach, MediTrack is here to support you and your loved
        ones.
      </p>

      {/* Image Section (you will import image) */}
      <div className="w-full max-w-3xl mb-16">
        <img
          src={app} // Replace with imported image
          alt="MediTrack About"
          className="rounded-2xl shadow-lg w-full object-cover"
        />
      </div>

      {/* Team Section */}
      <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-10 text-center">
        Meet Our Team
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {[
          { name: "Ayush Bunkar", tech: "AI & Web Devlopment" },
          { name: "Aditya Singh Patel", tech: "Project Lead & Hardware" },
          { name: "Aditya Singh Rathore", tech: "Presentation & PPT" },
          { name: "Riya Palod", tech: "Research & 3D Modeling" },
          { name: "Shikhar Mishra", tech: "AI & Hardware" },
          { name: "Shivang Raghuwanshi", tech: "Database" },
        ].map((member, index) => (
          <div
            key={index}
            className="bg-[#1f1f1f] p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#a3542d] to-[#7a1d1d] flex items-center justify-center text-xl font-bold text-white mb-4">
              {member.name.charAt(0)}
            </div>
            <h3 className="text-lg font-semibold text-white">{member.name}</h3>
            <p className="text-sm text-[#a1a1aa]">{member.tech}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
