import React from 'react';
import './Papers.css';
import Footer from '../components/Footer';
import { logEvent } from '../utils/analytics';
import TrackedLink from '../components/TrackedLink';

function Papers() {
  const papers = {
    specialIssues: [
      {
        title: "Forging Citizenship in China's Borderlands",
        role: "Co-Guest Editor",
        journal: "Citizenship Studies",
        status: "in progress"
      },
      {
        title: "China's Borderlands: From Getaway to Gateway",
        role: "Guest Editor",
        journal: "China Perspectives",
        issue: "139",
        link: "https://www.cefc.com.hk/issue/china-perspectives-139/"
      },
      {
        title: "Between Governance and the Governed: Navigating China's Borderlands in a Challenging Era",
        role: "Guest Editor",
        journal: "China Perspectives",
        issue: "138",
        link:"https://www.cefc.com.hk/issue/china-perspectives-138/"
      },
      {
        title: "China's Borderlands in the Post-Globalization Era",
        role: "Co-Guest Editor",
        journal: "China Information",
        issue: "36(3)",
        link:"https://journals.sagepub.com/toc/cina/36/3"
      }
    ],
    immigrantEntrepreneurship: [
      {
        authors: "Tianlong You and Zhaozhe Liang",
        year: "2024",
        title: "The Power of Culture: The Mechanisms Between the Cultural Capital of Transnational Entrepreneurs and Institutional Changes in Local Economic Governance in China",
        titleCn: "文化的力量：跨国企业家的文化资本与制度调整的机制分析",
        journal: "Social Science Perspectives",
        journalCn: "社会科学杂志",
        issue: "1(2)",
        pages: "231-262",
        link: "https://www.researchgate.net/publication/381434071_The_Power_of_Culture_The_Mechanisms_Between_the_Cultural_Capital_of_Transnational_Entrepreneurs_and_Institutional_Changes_in_Local_Economic_Governance_in_China?_sg%5B0%5D=1fz9fU-f2q0AKUkCQ6D0A5SWtKxq0f_tOCtu93BOeY4wPozr0QsiM8AV2wYfaJSChcqIbdxjpw4kXAhCseciMmxszwUcJWCVM9xVWMUS.NiUMw3QTR04Z0AF0iGheaM3P2EqUzqg1JL9gvxbCA4KrmfbP6QfH0O1sQTyEzO5NBmfMs9Whu-t4iOmPy499xA&_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInBvc2l0aW9uIjoicGFnZUNvbnRlbnQifX0"
      },
      {
        authors: "Tianlong You and Min Zhou.",
        year: "2022",
        title: "Simultaneous Embeddedness: A New Theoretical Framework of Immigrant Entrepreneurship ",
        titleCn: "“并行嵌入：国际移民企业研究的新理论模型”",
        journal: "Journal of World Peoples Studies ",
        journalCn: "世界民族",
        issue: "2022(3)",
        pages: "1-15",
        link: "https://www.researchgate.net/publication/382623174_Simultaneous_Embeddedness_A_New_Theoretical_Model_for_the_Study_of_Immigrant_Entrepreneurship_in_a_Globalized_World?_sg%5B0%5D=2Jhuh6L0D7GyhU76X1jQx4VFWDjYAKXK0GjiS0uqMvgw_eggGpjyHGFM6VE2zru35fm8EZ2Cl8ZyzGz52bLvKaN3wHyTN_xG-z8LjnFe.43WEZnBAz4znwss4ICf-f9HkztnZAl4qvjNET2dytrEM23qNC2Wrf_EQAZ7rMO0QOM2vchymPQ34nOVLt2uf4Q&_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInBvc2l0aW9uIjoicGFnZUNvbnRlbnQifX0"
      },
      {
        authors: "Tianlong You and Min Zhou.",
        year: "2021",
        title: "Gendered Patterns in Immigrant Entrepreneurships: A Case Study of Chinese-Owned Nail Salons in New York City",
        titleCn: "国际移民企业的性别模式：以纽约华裔美甲业为例",
        journal: "Journal of Guangxi Minzu University ",
        journalCn: "广西民族大学学报",
        issue: "2021(6)",
        pages: "22-27+51",
        link: "https://www.researchgate.net/publication/382623337_Gender_Patterns_in_Immigrant_Entrepreneurship_The_Case_of_Chinese-American_Nail_Salons_in_New_York_City?_sg%5B0%5D=rCgHCT5tQ1Lpciyy2mvH2yMJgr65By3tE8gxogYWO7DvgT72i_3TszmymDhxcbywslIZ2cls0cYLtpJ739pxfyT4AqBHipz-3NQLbIVf.kUUJ1eYU64w6JAWfGmdV7krva2zT-bUT9lyf-8my-ch94Hj4CucAa8wLYQpJjqC4kQCgyi4JNrPKdRrsrWd43Q&_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInBvc2l0aW9uIjoicGFnZUNvbnRlbnQifX0"
      },
      {
        authors: "Tianlong You and Min Zhou.",
        year: "2021",
        title: "Transnational Dynamics in Immigrant Entrepreneurship: A Case Study of Chinese-Owned Nail Salons in New York City",
        titleCn: "",
        journal: "Journal of Chinese Overseas ",
        journalCn: "",
        issue: "17(2)",
        pages: "239-264",
        link: "https://www.researchgate.net/publication/355745420_Gender_and_Transnational_Dynamics_in_Immigrant_Entrepreneurship_A_Case_Study_of_Chinese-Owned_Nail_Salons_in_New_York_City"
      },
      {
        authors: "Jennifer Nazareno, Min Zhou, and Tianlong You(corresponding author)",
        year: "2019",
        title: "Global Dynamics of Immigrant Entrepreneurship: Trends, Patterns, and Transnationalism.",
        titleCn: "",
        journal: " International Journal of Entrepreneurial Behaviour & Research",
        journalCn: "",
        issue: "25(5)",
        pages: "780-800",
        link:"https://www.researchgate.net/publication/327094154_Global_dynamics_of_immigrant_entrepreneurship_Changing_trends_ethnonational_variations_and_reconceptualizations"
      },
      {
        authors: "Tianlong You and Min Zhou",
        year: "2019",
        title: "Simultaneous Embeddedness of Immigrant Entrepreneurship: Global Forces Behind the Chinese-Owned Nail Salon Industry in New York City",
        titleCn: "",
        journal: "American Behavioral Scientist",
        journalCn: "",
        issue: "63(2)",
        pages: "166-185",
        link: "https://www.researchgate.net/publication/327119307_Simultaneous_Embeddedness_in_Immigrant_Entrepreneurship_Global_Forces_Behind_Chinese-Owned_Nail_Salons_in_New_York_City?_sg%5B0%5D=sPV2gQxs2LCfrm9LZB4smlfhL7COlefbc9gEo_0bo6pD6QPiT754Fxsv_-uohebbs31szI6LvwL56pS9gWGz8d2aC1_slkZm7iVag7f8.iPfonRLOlVrPwFMbqibZkIlEmNmSTCCQQMQWPSeNw7nF5y3vZk5AbS4BLVzqI52LismlxlyKpO2DRVH51RU73Q&_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInBvc2l0aW9uIjoicGFnZUNvbnRlbnQifX0"
      }
    ],
    migrationAndBorderStudies: [
      {
        authors: "Tianlong You",
        year: "2024",
        title: "Reframing China Studies: Insights from the Margins and Global Intersections of China's Borderlands",
        journal: "China Perspectives",
        issue: "139",
        pages: "3-6",
        link: "https://www.researchgate.net/publication/387738158_Reframing_China_Studies_Insights_from_the_Margins_and_Global_Intersections_of_China%27s_Borderlands"
      },
      {
        authors: "Tianlong You and Haijing Zhang",
        year: "2024",
        title: "The Making of Border Infrastructures: Evolution and Interaction with Cross-border Migration on the China–Myanmar Border",
        journal: "China Perspectives",
        issue: "139",
        pages: "33-45",
        link: "https://www.researchgate.net/publication/387739481_The_Making_of_Border_Infrastructures_Evolution_and_Interaction_with_Cross-Border_Migration_on_the_China-Myanmar_Border?_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInByZXZpb3VzUGFnZSI6InB1YmxpY2F0aW9uIiwicG9zaXRpb24iOiJwYWdlQ29udGVudCJ9fQ"
      },
      {
        authors: "Tianlong You and Ding Yuan",
        year: "2024",
        title: "Global China's Borderlands: Contemporary Characteristics in a Historical Trajectory",
        journal: "China Perspectives",
        issue: "138",
        pages: "3-8",
        link: "https://www.researchgate.net/publication/384770574_Global_China's_Borderlands_Contemporary_Characteristics_in_a_Historical_Trajectory?_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInBvc2l0aW9uIjoicGFnZUNvbnRlbnQifX0"
      },
      {
        authors: "Kejie Huang and Tianlong You",
        year: "2024",
        title: "Skill the Low-Skilled: A Study on the Skill Gain and Diversified Migration Trajectories of Vietnamese Workers in China",
        journal: "Comparative Migration Studies",
        pages: "1-18",
        link: "https://www.researchgate.net/publication/379642371_Skill_the_low-skilled_the_knowledge-driven_stepwise_migration_of_Vietnamese_workers_in_South_China?_sg%5B0%5D=UPtjeyEU_svWdlKpCvFhFsX_c3g6YCEvW9C3qFB6GHHM6TVUUELM-wUKXjDCUhzttoCSeUlDujT7LzdbE9oIP0JEow02GimGYy7LYzve.oODsP1mjG26ohn6kIM0__fHpDGjiANPmalEBA5Ci3AH_V3njE-I4A2jKa93TUFP0xb0x1ZtSRrIGvXRyMMNv5Q&_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInByZXZpb3VzUGFnZSI6InByb2ZpbGUiLCJwb3NpdGlvbiI6InBhZ2VDb250ZW50In19"
      },
      {
        authors: "Fangliang Zhang and Tianlong You",
        year: "2024",
        title: "From Making a Living to Making a Life: The Dynamics of the Social Transformation of the Communities of Foreign Nationals in China's Southwest Borderlands",
        titleCn: "从乐业到安居：西南边疆外籍人员社区变迁的动力机制研究",
        journal: "Journal of Social Development",
        journalCn: "社会发展研究",
        issue: "2024(1)",
        pages: "71-91",
        link:"https://www.researchgate.net/publication/382623348_From_making_a_living_to_making_a_life_The_dynamics_of_the_social_transformation_of_the_communities_of_foreign_nationals_in_China's_southwest_borderlands?_sg%5B0%5D=BjNCNsnjIB6W23guTZzNcGyt9ZFT_sCbaN59aO5Vm_FU5l257cKGY9kVaH13tVjlAYgxKKrO_rcGux_pILHEt6haCuld7HSSiwUHl6A-.t09dRXHC8SCnYHEiF1zvCqt8wqY-nDSQroFmDJBkDScYfMGIt3ZXhvcvsdOFB2OhexErMaZ_87w9E7fi-L-V0Q&_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInBvc2l0aW9uIjoicGFnZUNvbnRlbnQifX0"
      },
      {
        authors: "Tianlong You and Zhongsi Nie",
        year: "2023",
        title: "Fragmented Authoritarianism: The Institutional Crisis of the U.S. Immigration Management",
        titleCn: "碎片化威权：美式移民治理的体制危机",
        journal: "Beijing Culture Review",
        journalCn: "文化纵横",
        issue: "2023(4)",
        pages: "112-120",
        link:"https://www.researchgate.net/publication/382623112_Fragmented_AuthorityThe_Institutional_Crisis_of_the_USImmigration_Governance?_sg%5B0%5D=048rj6fCjiVvczJ9SATIsxPH5K9OsDpuVYEPyi5OdhteWAr82ghPbvDJSY4Mvk0jc6kjux_ug_hC6-y1NrytF1aHPtEKEGdTDs0bIGq9.0gp4LTdSm3DYdC7-9Yne9UyEpGYCWdracJklvXgbZ7cvWLRMYzyCenC__dB4WYgqsw1mhjzn0ZLn4XKedAwEQQ&_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInBvc2l0aW9uIjoicGFnZUNvbnRlbnQifX0"
      },
      {
        authors: "Yueping Wang, Tianlong You, and Tian Yang",
        year: "2022",
        title: "Transnational labor contractor regime in the China-Myanmar borderland: Mitigating hyper-precarity in the sugar cane cutting industry",
        journal: "China Information",
        issue: "36(3)",
        pages: "385-406",
        link: "https://www.researchgate.net/publication/364630218_China's_borderlands_in_the_post-globalization_era?_sg%5B0%5D=1c7Lcn8gthGJtAdelgMvKDAMXcQTaZXK_qqwK789AHcfZ5J0gsIZOjSC0khmqWQQl12Rt-uvdmoFGlV_e3MmSUbBkaTxCJhp33W8tUy2.xwvaA7zK0Cpy-RLBYKM5gsVNVnmwusj-uaR6WvzPM0rX3glU4h0dUk_HLqbyc1vmgIZoYIWhFp8AbtKWrorvqA&_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInBvc2l0aW9uIjoicGFnZUNvbnRlbnQifX0"
      },
      {
        authors: "Tianlong You and Mary Romero",
        year: "2022",
        title: "Introduction to the Special Issue: China's Borderlands in the Post-Globalization Era",
        journal: "China Information",
        issue: "36(3)",
        pages: "309-317",
        link: "https://www.researchgate.net/publication/364630218_China's_borderlands_in_the_post-globalization_era?_sg%5B0%5D=bJLHc96vuxdGHdebeMMKfR2kpqgNmqBgxuaYgz2Wl6OCv4lCFBuQNBfcxn_pvoc94Kp1KotZZYPee74yetxaXENF9SNluc7icHt-C4J3.6SIecGBcLNhEaRsR2YZtq8yQ1xeHUOrC1Ch1WixH4rlCyPPn3QCc9__5fK-JXiWcMmG2cnU-9nLmfXSe5czfwQ&_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InB1YmxpY2F0aW9uIiwicGFnZSI6InByb2ZpbGUiLCJwb3NpdGlvbiI6InBhZ2VDb250ZW50In19"
      }
    ],
    ethnicStudies: [
      {
        authors: "Tianlong You and Qian Ma",
        year: "2024",
        title: "Mobile Entrepreneurship, Policy Intervention, and Market Innovation: A Study on the Formation of Cross-Ethnic Economies from the Perspective of Mixed Embeddedness—The Case of the Heqing Bai Silverware Industry",
        titleCn: "流动创业，政策干预和市场革新：跨民族经济体形成的路径与模式研究——以鹤庆白族银器业为例",
        journal: "Journal of the Chinese Nation Studies",
        journalCn: "中华民族共同体研究",
        issue: "2024(4)",
        pages: "148-160",
        link: "https://www.researchgate.net/publication/384801567_Mobile_Entrepreneurship_Policy_Intervention_and_Market_Innovation_A_Study_on_the_Formation_of_Cross-Ethnic_Economies_from_the_Perspective_of_Mixed_Embeddedness-The_Case_of_the_Heqing_Bai_Silverware_In?_sg%5B0%5D=dXUM8eSyYVLPbIpIop4IzWf7-_NwlLl9h5_LMKnQwsLw43NIUWPaRAwwMA2lJc8vb4YxVlB-tsQQ_LVpBhmr-iA3V31OG4fBXGd2DFHX.VxUog4rReE1tqp7-3meP2RSRIyTteC_HbPlTkodb4TzRdPVi-CP28Y4IqygxyKCU_Fz42sp6ZyHxj7O3NjRLew&_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInBvc2l0aW9uIjoicGFnZUNvbnRlbnQifX0"
      },
      {
        authors: "Taihui Guo and Tianlong You",
        year: "2023",
        title: "Creating the Governable Population: Authoritarian Cultural Citizenship and the Ethnic Minorities in a Sino-Tibetan Intercultural Area in Contemporary China",
        journal: "Citizenship Studies",
        issue: "27(5)",
        pages: "654-672",
        link: "https://www.researchgate.net/publication/376094645_Creating_the_governable_population_authoritarian_cultural_citizenship_and_the_ethnic_minorities_in_a_Sino-Tibetan_intercultural_area_in_contemporary_China?_sg%5B0%5D=oXE7K-KPDY1UKOocYaEpfa2XjpmNQ4Izmh0GrhrIkJ3k4RzKGT-ZHsQcLiRGBgKa73Z8Bh9LTg7aJ1dT1Y7AKQ8IKFOL6Hs_SUzN5lsO.k9LrhQszgsUj_ahp_fnqWuB3cj4x5N_IsdDhtxHzx_cjoiD-egIC585sCNp2KOrCzGXtvdpq8KQtz307M_svIA&_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6InByb2ZpbGUiLCJwYWdlIjoicHJvZmlsZSIsInBvc2l0aW9uIjoicGFnZUNvbnRlbnQifX0"
      },
      {
        authors: "Tianlong You",
        year: "2021",
        title: "Factors Behind the Diverging Attitudes Among Asian Americans Towards the Racial Justice Movements in the United States",
        titleCn: "剖析美国亚裔内部对于种族平权运动产生态度分歧的原因",
        journal: "Journal of World Peoples Studies",
        journalCn: "世界民族",
        issue: "2021(5)",
        link: "https://www.researchgate.net/publication/382623336_Factors_Behind_the_Diverging_Attitudes_Among_Asian_Americans_Towards_the_Racial_Justice_Movements_in_the_United_States?_sg%5B0%5D=bJLHc96vuxdGHdebeMMKfR2kpqgNmqBgxuaYgz2Wl6OCv4lCFBuQNBfcxn_pvoc94Kp1KotZZYPee74yetxaXENF9SNluc7icHt-C4J3.6SIecGBcLNhEaRsR2YZtq8yQ1xeHUOrC1Ch1WixH4rlCyPPn3QCc9__5fK-JXiWcMmG2cnU-9nLmfXSe5czfwQ"
      }
    ],
    platformStudies: [
      {
        authors: "Tianlong You and Zhongsi Nie",
        year: "2024",
        title: "From Expansion to Exclusion: Recalibrating Rural E-Commerce in the New-Era Political Economy in Western China",
        journal: "Chinese Journal of Communication",
        pages: "link",
        link: "https://www.tandfonline.com/doi/full/10.1080/17544750.2024.2385530",
        doi: "https://doi.org/10.1080/17544750.2024.2385530"
      },
      {
        authors: "Tianlong You",
        year: "2023",
        title: "Embeddedness at Varying Depths: Interactions Between Rural E-Commerce Entrepreneurs and China's Local Politico-Economic Contexts",
        journal: "Journal of Chinese Sociology",
        pages: "1-19",
        link: "https://www.researchgate.net/publication/376169095_Embeddedness_at_varying_depths_interactions_between_rural_e-commerce_entrepreneurs_and_China's_local_politico-economic_contexts",
        doi: "10.1186/s40711-023-00201-9"
      }
    ]
  };

  // 添加一个辅助函数来处理作者名字的加粗
  const formatAuthors = (authors) => {
    return authors.replace(
      /Tianlong You/g, 
      '<strong>Tianlong You</strong>'
    );
  };

  // 追踪论文下载
  const handlePaperDownload = (paperTitle) => {
    logEvent('Papers', 'Download', paperTitle);
    // ... 下载逻辑
  };

  // 追踪外部链接点击
  const handleExternalLink = (paperTitle) => {
    logEvent('Papers', 'External Link Click', paperTitle);
    // ... 链接跳转逻辑
  };

  return (
    <div className="papers">
      <div className="papers-content">
        <section className="paper-section">
          <h2>Special Issues</h2>
          <div className="papers-list">
            {papers.specialIssues.map((paper, index) => (
              <div key={index} className="paper-item special-issue">
                <TrackedLink 
                  href={paper.link}
                  category="Papers"
                  label={`Special Issue: ${paper.title}`}
                  className="paper-link"
                >
                  <div className="paper-role">{paper.role}</div>
                  <div className="paper-title">{paper.title}</div>
                  <div className="paper-journal">
                    <em>{paper.journal}</em>
                    {paper.issue && `, ${paper.issue}`}
                    {paper.status && `, ${paper.status}`}
                  </div>
                </TrackedLink>
              </div>
            ))}
          </div>
        </section>

        <section className="paper-section">
          <h2>Immigrant Entrepreneurship</h2>
          <div className="papers-list">
            {papers.immigrantEntrepreneurship.map((paper, index) => (
              <div key={index} className="paper-item">
                <TrackedLink 
                  href={paper.link}
                  category="Papers"
                  label={`Immigrant Entrepreneurship: ${paper.title}`}
                  className="paper-link"
                >
                  <div className="paper-citation">
                    <span dangerouslySetInnerHTML={{ 
                      __html: formatAuthors(paper.authors) 
                    }} />
                    . {paper.year}. {paper.title}
                    {paper.titleCn && ` (${paper.titleCn})`}. <em>{paper.journal}</em>
                    {paper.journalCn && ` (${paper.journalCn})`}
                    {paper.issue && `, ${paper.issue}`}
                    {paper.pages && `, ${paper.pages}`}.
                  </div>
                </TrackedLink>
              </div>
            ))}
          </div>
        </section>

        <section className="paper-section">
          <h2>Migration and Border Studies</h2>
          <div className="papers-list">
            {papers.migrationAndBorderStudies.map((paper, index) => (
              <div key={index} className="paper-item">
                <TrackedLink 
                  href={paper.link}
                  category="Papers"
                  label={`Migration and Border Studies: ${paper.title}`}
                  className="paper-link"
                >
                  <div className="paper-citation">
                    <span dangerouslySetInnerHTML={{ 
                      __html: formatAuthors(paper.authors) 
                    }} />
                    . {paper.year}. {paper.title}
                    {paper.titleCn && ` (${paper.titleCn})`}. <em>{paper.journal}</em>
                    {paper.journalCn && ` (${paper.journalCn})`}
                    {paper.issue && `, ${paper.issue}`}
                    {paper.pages && `, ${paper.pages}`}.
                  </div>
                </TrackedLink>
              </div>
            ))}
          </div>
        </section>

        <section className="paper-section">
          <h2>Ethnic Studies</h2>
          <div className="papers-list">
            {papers.ethnicStudies.map((paper, index) => (
              <div key={index} className="paper-item">
                <TrackedLink 
                  href={paper.link}
                  category="Papers"
                  label={`Ethnic Studies: ${paper.title}`}
                  className="paper-link"
                >
                  <div className="paper-citation">
                    <span dangerouslySetInnerHTML={{ 
                      __html: formatAuthors(paper.authors) 
                    }} />
                    . {paper.year}. {paper.title}
                    {paper.titleCn && ` (${paper.titleCn})`}. <em>{paper.journal}</em>
                    {paper.journalCn && ` (${paper.journalCn})`}
                    {paper.issue && `, ${paper.issue}`}
                    {paper.pages && `, ${paper.pages}`}.
                  </div>
                </TrackedLink>
              </div>
            ))}
          </div>
        </section>

        <section className="paper-section">
          <h2>Platform Studies</h2>
          <div className="papers-list">
            {papers.platformStudies.map((paper, index) => (
              <div key={index} className="paper-item">
                <TrackedLink 
                  href={paper.link}
                  category="Papers"
                  label={`Platform Studies: ${paper.title}`}
                  className="paper-link"
                >
                  <div className="paper-citation">
                    <span dangerouslySetInnerHTML={{ 
                      __html: formatAuthors(paper.authors) 
                    }} />
                    . {paper.year}. {paper.title}
                    {paper.titleCn && ` (${paper.titleCn})`}. <em>{paper.journal}</em>
                    {paper.journalCn && ` (${paper.journalCn})`}
                    {paper.issue && `, ${paper.issue}`}
                    {paper.pages && `, ${paper.pages}`}.
                  </div>
                </TrackedLink>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default Papers; 