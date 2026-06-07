import Navbar from "@/components/arc-navbar";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 pb-16 mb-10 mt-30">
      <Navbar />

      <div className="max-w-3xl w-full ">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-base text-gray-500">Last updated: June 4, 2026</p>
        </div>

        {/* Intro */}
        <div className="mb-10 space-y-4 text-gray-700 leading-relaxed">
          <p>
            Welcome to Mentoreo! We built this platform to bring transparency to
            college admissions. To do that, we need to collect a bit of data to
            keep the platform safe, ensure our mentors are verified, and make
            sure everyone gets paid.
          </p>
          <p>
            This policy explains what we collect, why we collect it, and how we
            protect it. We believe in the "Truth Button," and that includes
            being 100% truthful about your data.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">

          <Section title="1. Information We Collect">
            <ul className="space-y-5">
              <ListItem label="Account Information">
                For Aspirants, we collect your name, phone number (for account
                creation, login, and updates), and target colleges.
              </ListItem>
              <ListItem label="Verification Data (Mentors Only)">
                To ensure the "Truth Button" is real, mentors must provide their
                college ID card or official university email.
              </ListItem>
              <ListItem label="Financial Information">
                For Mentors to receive their payouts and Aspirants to add funds,
                we collect necessary transaction details. We use Razorpay as our
                secure payment gateway; we do not store your raw bank passwords
                or credit card numbers on our servers.
              </ListItem>
              <ListItem label="Communication Data">
                We use Sendbird, a secure third-party communication SDK, to power
                our in-app chats and calls. We collect chat logs and metadata
                regarding calls made through our platform. This data is used
                strictly for handling user reports, maintaining platform safety,
                and resolving disputes.
              </ListItem>
              <ListItem label="Device & Usage Data">
                We collect basic analytics (such as device type, operating
                system, and usage patterns) to fix bugs and improve the
                matchmaking experience.
              </ListItem>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p className="text-gray-600 mb-5">
              We don't sell your data to marketing agencies. We use it to:
            </p>
            <ul className="space-y-5">
              <ListItem label="Connect You">
                Match aspirants with relevant seniors based on colleges and
                branches of interest.
              </ListItem>
              <ListItem label="Protect Your Privacy">
                Calls are powered by Sendbird, and personal phone numbers are
                never shared between users.
              </ListItem>
              <ListItem label="Process Payments">
                Securely charge aspirants and route mentor earnings through
                Razorpay.
              </ListItem>
              <ListItem label="Keep the Platform Safe">
                Use verification and communication data to prevent abuse, resolve
                disputes, and maintain platform quality.
              </ListItem>
            </ul>
          </Section>

          <Section title="3. How We Share Your Information">
            <p className="text-gray-600 mb-5">
              We only share your information in limited circumstances:
            </p>
            <ul className="space-y-5">
              <ListItem label="Other Users">
                Aspirants can view a mentor's verified first name, college, and
                branch. Mentors can view an aspirant's basic profile details.
                Phone numbers are never shared.
              </ListItem>
              <ListItem label="Service Providers">
                <span>We work with trusted third-party partners:</span>
                <ul className="mt-2 ml-4 space-y-1 text-gray-600">
                  <li>Razorpay for payments and mentor payouts.</li>
                  <li>Sendbird for chat and audio call infrastructure.</li>
                  <li>
                    Render for hosting backend services and securely storing
                    data.
                  </li>
                </ul>
              </ListItem>
              <ListItem label="Legal Requirements">
                We may disclose information if required by law, court order, or
                to protect user safety.
              </ListItem>
            </ul>
          </Section>

          <Section title="4. Data Retention and Deletion">
            <ul className="space-y-5">
              <ListItem label="Retention">
                We keep your data only while your account remains active.
              </ListItem>
              <ListItem label="Your Right to Delete">
                You can delete your account from app settings. Personal profile
                data will be removed within 30 days of a deletion request.
              </ListItem>
              <ListItem label="Exception">
                Transaction records and dispute logs may be retained longer when
                required by financial regulations or for fraud prevention.
              </ListItem>
            </ul>
          </Section>

          <Section title="5. Children's Privacy">
            <p className="text-gray-600 leading-relaxed">
              Mentoreo is designed for high school and college students. You must
              be at least 13 years old to use the platform.
            </p>
          </Section>

          <Section title="6. Changes to this Policy">
            <p className="text-gray-600 leading-relaxed">
              As we add new features, we may update this Privacy Policy. If we
              make significant changes, we will notify you through the app, SMS,
              or WhatsApp.
            </p>
          </Section>

          <Section title="7. Contact Us">
            <p className="text-gray-600 mb-4">
              Got questions about your data? Reach out to us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>
                <a
                  href="mailto:shauraydhingra03@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  shauraydhingra03@gmail.com
                </a>
              </p>
              <p>
                <a
                  href="mailto:kampani.ojas@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  kampani.ojas@gmail.com
                </a>
              </p>
            </div>
          </Section>

        </div>

        {/* Footer spacer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400">© 2026 Mentoreo. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-gray-100 pt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
      {children}
    </section>
  );
}

function ListItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gray-300 translate-y-2" />
      <div className="text-gray-600 leading-relaxed">
        <span className="font-medium text-gray-900">{label}: </span>
        {children}
      </div>
    </li>
  );
}