import React from 'react';
import './Teaching.css';
import Footer from '../components/Footer';
import migrationImage from '../assets/images/Visualizing-Migration.jpg';
import borderImage from '../assets/images/teach2.webp';
import oralHistoryImage from '../assets/images/OralHistory.jpeg';
import platformImage from '../assets/images/platform.webp';

function Teaching() {
  const undergraduateCourses = [
    {
      title: "Sociology of Immigration",
      image: migrationImage,
      description: "Immigrants are a constant presence in our world, shaping societies throughout history—from our ancestors' migration out of Africa, to contemporary refugee crises, to high-skilled talents navigating complex immigration systems, and the wealthy seeking tax havens. This course examines the social, economic, and political dimensions of immigration, focusing on the diverse experiences of immigrants in various global contexts."
    },
    {
      title: "Oral History Methods and Practices",
      image: oralHistoryImage,
      description: "This course introduces students to the methodologies of oral history and ethnographic research. Through hands-on projects, students learn to conduct interviews, analyze narratives, and document lived experiences while considering ethical implications and best practices in qualitative research."
    },
    {
      title: "Platform Studies",
      image: platformImage,
      description: "This course examines how digital platforms reshape social interactions, economic transactions, and cultural practices. Students analyze platform governance, algorithmic systems, and their impacts on society while developing critical perspectives on digital transformation."
    }
  ];

  const postgraduateCourses = [
    {
      title: "Global Migration in the Era of (De-) Globalization",
      image: borderImage,
      description: "This course explores borders as complex social constructs that shape human mobility, identity, and power relations. Students examine how borders function as both physical and symbolic barriers, analyzing their role in globalization, nationalism, and transnational movements."
    }
  ];

  return (
    <div className="teaching">
      <div className="teaching-content">
        <div className="teaching-intro">
          <h1>Teaching</h1>
          <p>
          I teach a range of courses at both the undergraduate and graduate levels, focusing on the intersections of migration, globalization, borders, and sociological methods. My teaching philosophy centers on empowering students to develop a keen sociological perspective, fostering their ability to critically analyze complex social phenomena. I strive to provide my students with the tools necessary for academic excellence and to inspire them to become actively engaged and informed citizens. Through a blend of theoretical frameworks and practical applications, my courses aim to cultivate a deep understanding of the sociopolitical dynamics shaping our world.
          </p>
        </div>

        <section className="course-section">
          <h2>Undergraduate Courses</h2>
          <div className="courses-grid">
            {undergraduateCourses.map((course, index) => (
              <div key={index} className="course-card">
                <div className="course-image">
                  <img src={course.image} alt={course.title} />
                </div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="course-section">
          <h2>Postgraduate Courses</h2>
          <div className="courses-grid">
            {postgraduateCourses.map((course, index) => (
              <div key={index} className="course-card">
                <div className="course-image">
                  <img src={course.image} alt={course.title} />
                </div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default Teaching; 