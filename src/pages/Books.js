import React, { useState } from 'react';
import './Books.css';
import { FaPlus, FaMinus } from 'react-icons/fa';
import bookCover from '../assets/images/alibaba.png';
import nailSalonCover from '../assets/images/nailSalon.jpg';
import Footer from '../components/Footer';

function Books() {
  const [expandedBook, setExpandedBook] = useState(null);

  const books = [
    {
      id: 1,
      title: "The Rise and Fall of Digital Developmental Villages: The Political Economy of China's Rural E-Commerce in the New Era",
      cover: bookCover,
      publisher: "Palgrave Macmillan",
      shortDescription: "This study examines China's rural e-commerce landscape, exploring the interactions between central and local governments, e-commerce giants, and rural entrepreneurs, highlighting how policies and platforms shape rural economies particularly in the New Era.",
      fullDescription: `My first book project, contracted with Palgrave Macmillan, explores the transformation of China's rural e-commerce landscape through the concept of the "Digital Developmental Village." Drawing from my dissertation research, this book examines how rural areas in China have been reshaped into digital hubs through the collaborative efforts of platform giants like Alibaba, local governments, and rural entrepreneurs. It situates these transformations within the broader framework of the New Era and the evolving political economy of China.

The book integrates multiple strands of literature, including state capitalism, developmental state theory, and industrial policy, to trace the rise and fall of rural e-commerce in China. Through extensive fieldwork across thirty-seven villages in seven provinces, the study highlights how digital platforms have trained local officials, established new state-business relations, and created opportunities for rural entrepreneurs. However, these developments have not been without challenges, as regulatory crackdowns and political priorities have reshaped the digital economy.

Organized into several empirical chapters, the book explores the different phases of rural e-commerce development, regional variations, and the critical role of local governance and return migrants. The study concludes with an analysis of how the Communist Party of China has integrated itself into the rural e-commerce sector to ensure political loyalty and stability, while simultaneously boosting China's global digital economy.`
    },
    {
      id: 2,
      title: "At Your Fingertips: Globalizing the Nail Salon Services in the Platformization Era",
      cover: nailSalonCover,
      publisher: "",
      shortDescription: "Drawing on fieldwork conducted in the United States, China, and Vietnam, this study explores the simultaneously embedded, immigrant-dominated service sector that utilizes resources from the sending, receiving, and third countries to thrive, only to be undermined by the foreign manufacturing power through e-commerce.",
      fullDescription: "My second book project investigates how low-skilled immigrant entrepreneurs in the U.S. personal service sector are simultaneously embedded within global forces spanning the sending, receiving, and third countries, amidst the rise of e-commerce in China. Drawing on extensive fieldwork in Vietnam, China, and the United States, this research explores the intersections of entrepreneurship, global migration, gender dynamics, and platform capitalism in a transnational space. The book begins by examining the labor shortage in Chinese-owned nail salons in New York City, a notable exception to the Vietnamese dominance in this sector across many developed countries. It then moves to explore the global labor supply chain that connects rural Vietnamese areas with global cities, driving the migration of Vietnamese workers abroad. Finally, the study highlights Donghai, a little-known coastal county in China, where the emergence of a wear-on nails manufacturing industry, facilitated by cross-border e-commerce, undermines the job security of Vietnamese workers by reducing demand for labor-intensive nail salon services. The book also examines how immigrant entrepreneurs, facing these global shifts, engage in collective action to advocate for U.S. sanctions against Chinese platform giants. Ultimately, this project offers a micro-sociological account of globalization, providing insights into the complexities and resilience of immigrant entrepreneurship in a rapidly evolving but increasingly fragmented world as China and the United States experience economic decoupling."  // 完整描述可以在有更多内容时更新
    }
  ];

  const toggleDescription = (bookId) => {
    setExpandedBook(expandedBook === bookId ? null : bookId);
  };

  return (
    <div className="books">
      <div className="books-content">
        {books.map((book) => (
          <div key={book.id} className="book-item">
            <div className="book-header">
              <div className="book-cover">
                <img src={book.cover} alt={book.title} />
              </div>
              <div className="book-title-section">
                <h2>{book.title}</h2>
                <div className="book-metadata">
                  <span>{book.publisher}</span>
                </div>
              </div>
            </div>
            <div className="book-description">
              <p>{expandedBook === book.id ? book.fullDescription : book.shortDescription}</p>
              <button 
                className="expand-button"
                onClick={() => toggleDescription(book.id)}
                aria-label={expandedBook === book.id ? "Show less" : "Show more"}
              >
                {expandedBook === book.id ? <FaMinus /> : <FaPlus />}
              </button>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default Books; 