import { User } from "lucide-react";
import { TEAM } from "@/lib/team";

export function Team() {
  return (
    <section className="py-24 px-4 bg-white" id="team">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FFF4ED] text-[#F97316] text-sm font-semibold px-4 py-2 rounded-full mb-4">
            Команда
          </div>
          <h2 className="text-4xl font-black text-[#0F0F0F] mb-4">
            Жоба координаторлары
          </h2>
          <p className="text-lg text-[#3B3B3B] max-w-xl mx-auto">
            JARYQ артындағы адамдар — қазақ тіліне және аудиокітаптарға деген
            ортақ сүйіспеншілігі бар команда.
          </p>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member, index) => (
            <li
              key={index}
              className="bg-[#F5F5F5] rounded-2xl p-6 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Avatar */}
              <div
                aria-hidden="true"
                className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center shadow-md"
              >
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photoUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={36} className="text-white opacity-80" />
                )}
              </div>

              <h3 className="text-lg font-bold text-[#0F0F0F] mb-1">
                {member.name}
              </h3>
              <p className="text-sm font-semibold text-[#F97316] mb-3">
                {member.role}
              </p>
              {member.bio && (
                <p className="text-sm text-[#3B3B3B] leading-relaxed">
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
