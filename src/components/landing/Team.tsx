import { User } from "lucide-react";
import { TEAM } from "@/lib/team";

export function Team() {
  return (
    <section className="py-24 px-4 bg-white" id="team">
      <div className="max-w-7xl mx-auto jaryq-reveal">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-jaryq-primary-soft text-jaryq-primary text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-jaryq-border-warm">
            Команда
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-jaryq-text-primary mb-4 tracking-tight">
            Жоба координаторлары
          </h2>
          <p className="text-lg text-jaryq-text-secondary max-w-xl mx-auto">
            JARYQ артындағы адамдар — қазақ тіліне және аудиокітаптарға деген
            ортақ сүйіспеншілігі бар команда.
          </p>
        </div>

        <ul
          data-reveal-group
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {TEAM.map((member, index) => (
            <li
              key={index}
              data-reveal
              className="jaryq-card jaryq-card-hover jaryq-reveal group rounded-2xl p-6 text-center motion-reduce:hover:translate-y-0"
              style={{ backgroundColor: "var(--color-jaryq-bg-cream)" }}
            >
              {/* Avatar */}
              <div
                aria-hidden="true"
                className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden jaryq-gradient-cta-radial flex items-center justify-center transition-transform duration-(--duration-jaryq-base) group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
              >
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photoUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={36} className="text-white opacity-90" />
                )}
              </div>

              <h3 className="font-display text-lg font-bold text-jaryq-text-primary mb-1">
                {member.name}
              </h3>
              <p className="text-sm font-semibold text-jaryq-primary mb-3">
                {member.role}
              </p>
              {member.bio && (
                <p className="text-sm text-jaryq-text-secondary leading-relaxed">
                  {member.bio}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
