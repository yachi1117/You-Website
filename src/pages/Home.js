import React from 'react';
import './Home.css';
import headshot from '../assets/images/headshot.png';
import { SiGooglescholar } from 'react-icons/si';
import { FaLinkedinIn, FaResearchgate } from 'react-icons/fa';
import TrackedLink from '../components/TrackedLink';

function Home() {
  return (
    <article className="home">
      <div className="home-content">
        <div className="profile-container">
          <div className="profile-left">
            <div className="profile-image">
              <img src={headshot} alt="Dr. Tianlong You" />
            </div>
            <div className="contact-me">
              <h2>Contact Me</h2>
              <div className="contact-links">
                <div className="social-links">
                  <TrackedLink 
                    href="https://scholar.google.com/citations?hl=zh-CN&user=4sSuatgAAAAJ"
                    category="Social"
                    label="Google Scholar"
                    className="icon-link"
                  >
                    <SiGooglescholar />
                  </TrackedLink>
                  
                  <TrackedLink 
                    href="https://www.linkedin.com/in/tianlong-you-6a771431b/"
                    category="Social"
                    label="LinkedIn"
                    className="icon-link"
                  >
                    <FaLinkedinIn />
                  </TrackedLink>
                  
                  <TrackedLink 
                    href="https://www.researchgate.net/profile/Tianlong-You"
                    category="Social"
                    label="ResearchGate"
                    className="icon-link"
                  >
                    <FaResearchgate />
                  </TrackedLink>
                </div>
                <div className="contact-info">
                  <a 
                    href="mailto:tyou0410@gmail.com" 
                    className="email"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText('tyou0410@gmail.com')
                        .then(() => {
                          const target = e.target;
                          target.textContent = 'Copied!';
                          setTimeout(() => {
                            target.textContent = 'tyou0410@gmail.com';
                          }, 1500);
                        })
                        .catch(err => {
                          console.error('Failed to copy:', err);
                        });
                    }}
                  >
                    tyou0410@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="profile-text">
            <h1>About Me</h1>
            <div className="introduction">
              <p>
                Hello, world! I am an Associate Professor from Yunnan University and an Affiliate Faculty of the Center for Global Health at Arizona State University. I earned Ph.D. from ASU and J.D. from Hofstra University. I also held a Graduate Certificate in Immigration Studies from ASU.
              </p>
              <p>
                As an immigration sociologist, my research focuses on how the global forces influence immigrant entrepreneurship in little-known emerging county-level economic hubs, particularly in our increasingly digital world. My book project, <em>The Rise and Fall of Digital Development Villages: The Political Economy of China's Rural E-Commerce in the New Era</em>, forthcoming from Palgrave Macmillan, explores how China's dynamic political economy, especially the rise of e-commerce, is transforming thousands of villages in the New Era. My scholarly work has been published in leading journals such as the American Behavioral Scientist, China Information, Citizenship Studies and Chinese Journal of Communication.
              </p>
              <p>
                Currently, I am an Associate Editor for <em>Comparative Migration Studies</em> and the executive editor-in-chief for Kuige Sociological Review ("《魁阁学刊》"). I have also served as a guest editor for special issues on China's borderlands in journals like <em>China Information</em>, <em>China Perspectives</em>, and <em>Citizenship Studies</em>.
              </p>
              <p>
                Beyond academia, I have contributed to public discourse as a columnist and podcaster, offering insights on global migration issues for various media outlets, including The New York Times and BBC.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Tianlong You",
          "honorificPrefix": "Dr.",
          "jobTitle": "Associate Professor",
          "worksFor": {
            "@type": "Organization",
            "name": "Yunnan University"
          },
          "alumniOf": [
            {
              "@type": "Organization",
              "name": "Arizona State University"
            },
            {
              "@type": "Organization",
              "name": "Hofstra University"
            }
          ],
          "description": "Immigration sociologist specializing in immigrant entrepreneurship and digital development in emerging economic hubs.",
          "url": "https://yourwebsite.com",
          "sameAs": [
            "https://scholar.google.com/citations?hl=zh-CN&user=4sSuatgAAAAJ",
            "https://www.linkedin.com/in/tianlong-you-6a771431b/",
            "https://www.researchgate.net/profile/Tianlong-You"
          ]
        })}
      </script>
    </article>
  );
}

export default Home; 