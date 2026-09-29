import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { Briefcase, Calendar } from 'lucide-react';

const ExperienceSection = () => {
  const { t } = useLanguage();

  const experiences = [
    {
      id: 'soma',
      role: t('experience.job1_role'),
      company: t('experience.job1_company'),
      period: t('experience.job1_period'),
      isCurrent: true,
      currentBadge: t('experience.current_badge'),
      bullets: [
        t('experience.job1_b1'),
        t('experience.job1_b2'),
        t('experience.job1_b3'),
        t('experience.job1_b4'),
      ],
      techs: ['Laravel', 'Vue.js', 'PostgreSQL', 'MySQL', 'REST APIs', 'Webhooks', 'Service-Repository']
    },
    {
      id: 'onikode',
      role: t('experience.job2_role'),
      company: t('experience.job2_company'),
      period: t('experience.job2_period'),
      isCurrent: false,
      bullets: [
        t('experience.job2_b1'),
        t('experience.job2_b2'),
        t('experience.job2_b3'),
      ],
      techs: ['Angular', 'TypeScript', 'REST APIs', 'Git / Bitbucket', 'Jira']
    }
  ];

  return (
    <section className="mb-stack-lg relative" id="experience">
      <div className="section-header mb-12">
        <div className="corner-bracket-tl"></div>
        <h2 className="font-headline-lg text-headline-lg text-text-primary uppercase tracking-tight">
          {t('experience.title')}{' '}
          <span className="text-primary-fixed">{t('experience.title_highlight')}</span>
        </h2>
      </div>

      <div className="relative">
        {/* Continuous Timeline Line */}
        <div className="absolute left-3 md:left-6 top-3 bottom-6 w-[2px] bg-gradient-to-b from-primary-fixed via-primary-fixed/40 to-transparent"></div>

        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative pl-10 md:pl-20 group"
            >
              {/* Timeline Indicator Dot */}
              <div 
                className={`absolute left-[5px] md:left-[17px] top-6 w-4 h-4 rounded-full border-2 transition-transform duration-300 group-hover:scale-125 ${
                  exp.isCurrent
                    ? 'bg-primary-fixed border-black shadow-[0_0_12px_rgba(255,230,0,0.8)]'
                    : 'bg-surface border-primary-fixed/60 shadow-[0_0_8px_rgba(0,210,255,0.4)]'
                }`}
              >
                {exp.isCurrent && (
                  <span className="absolute -inset-1 rounded-full bg-primary-fixed/40 animate-ping"></span>
                )}
              </div>

              {/* Experience Card */}
              <div 
                className={`glass-panel p-6 md:p-8 rounded-xl border transition-all duration-300 relative ${
                  exp.isCurrent
                    ? 'border-primary-fixed/40 hover:border-primary-fixed shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
                    : 'border-white/10 hover:border-primary-fixed/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-headline-md text-xl md:text-2xl text-text-primary uppercase font-bold tracking-tight">
                        {exp.role}
                      </h3>
                      {exp.isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary-fixed text-black shadow-sm">
                          {exp.currentBadge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="w-4 h-4 text-primary-fixed" />
                      <span className="text-primary-fixed font-bold uppercase text-sm md:text-base tracking-wider">
                        {exp.company}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-code-sm text-xs bg-surface-container/80 px-3 py-1.5 rounded-full text-on-surface-variant border border-white/5 w-fit">
                    <Calendar className="w-3.5 h-3.5 text-primary-fixed/70" />
                    <span>{exp.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-on-surface-variant font-body-md text-sm md:text-[15px] leading-relaxed mb-6">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5">
                      <span className="text-primary-fixed text-xs mt-1.5 shrink-0">❯</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                  {exp.techs.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-code-sm font-medium px-2.5 py-1 rounded-md bg-white/5 text-on-surface-variant border border-white/5 hover:border-primary-fixed/40 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
