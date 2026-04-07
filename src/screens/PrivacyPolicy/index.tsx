import { PageLayout } from '../../components/PageLayout'

export function PrivacyPolicy() {
  return (
    <PageLayout backTo="/">
      <div className="px-4 py-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1">Privacy Policy</h1>
          <p className="text-xs text-muted">Last updated: April 7, 2026</p>
        </div>

        <section className="card p-4 flex flex-col gap-2">
          <h2 className="font-semibold text-ink">Analytics</h2>
          <p className="text-sm text-muted leading-relaxed">
            This site uses{' '}
            <a
              href="https://www.cloudflare.com/web-analytics/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline focus-ring rounded"
            >
              Cloudflare Web Analytics
            </a>
            . It sets no cookies, does not fingerprint users, and does not track
            you across sites. Only aggregated data (page views, referrers,
            browser type) is collected. Cloudflare's handling of that data is
            described in their{' '}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline focus-ring rounded"
            >
              privacy policy
            </a>
            .
          </p>
        </section>

        <section className="card p-4 flex flex-col gap-2">
          <h2 className="font-semibold text-ink">Your bill data</h2>
          <p className="text-sm text-muted leading-relaxed">
            Bill data (people, items, amounts) is stored only in your browser's
            localStorage. It never leaves your device — Divvy has no server and
            sends no data anywhere. Shared bill links are encoded entirely in
            the URL; nothing is stored remotely.
          </p>
        </section>

        <section className="card p-4 flex flex-col gap-2">
          <h2 className="font-semibold text-ink">
            No accounts, ads, or tracking
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Divvy has no user accounts, collects no personal information, serves
            no ads, and uses no third-party tracking beyond the analytics
            described above.
          </p>
        </section>
      </div>
    </PageLayout>
  )
}
