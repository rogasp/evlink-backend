// src/components/TermsContent.tsx

export default function TermsContent() {
  return (
    <div className="space-y-4 text-sm text-gray-700 max-h-[70vh] overflow-y-auto pr-2">
      <p>
        By using EVLinkHA, you agree to the following terms and conditions. This service is
        provided as-is, with no warranties or guarantees. You are responsible for any actions
        performed through your linked accounts.
      </p>
      <p>
        This is a hobby project and is not affiliated with any car manufacturers. Use at your own
        risk.
      </p>
      <p>
        Your data is handled securely and never sold to third parties. Read our privacy policy for
        more details.
      </p>

      <h3 className="font-semibold mt-6">Corrections</h3>
      <p>
        There may be information on the Site that contains typographical errors, inaccuracies, or
        omissions. We reserve the right to correct any errors and update the information at any
        time.
      </p>

      <h3 className="font-semibold mt-6">Disclaimer</h3>
      <p>
        THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE
        AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE
        DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE
        THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
        FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS
        ABOUT THE ACCURACY OR COMPLETENESS OF THE SITE’S CONTENT OR THE CONTENT OF ANY WEBSITES
        LINKED TO THE SITE AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS,
        MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE,
        OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SITE, (3) ANY
        UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION
        AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF
        TRANSMISSION TO OR FROM THE SITE, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH
        MAY BE TRANSMITTED TO OR THROUGH THE SITE BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR
        OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A
        RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE
        SITE. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR
        SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SITE, ANY HYPERLINKED WEBSITE,
        OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL
        NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU
        AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES.
      </p>
      <p>
        AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU
        SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.
      </p>

      <h3 className="font-semibold mt-6">Limitations of Liability</h3>
      <p>
        IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD
        PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE
        DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM
        YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>

      <h3 className="font-semibold mt-6">Contact Information</h3>
      <p>
        If you have any questions or concerns regarding these Terms, please contact our customer
        support:
      </p>
      <ul className="list-disc list-inside">
        <li><strong>Name:</strong> Roger Aspelin</li>
        <li><strong>Email:</strong> <a href="mailto:roger@evlinkha.se" className="underline">roger@evlinkha.se</a></li>
        <li><strong>Address:</strong> Djuprännilen 351, 13767 Jordbro, Sweden</li>
        <li><strong>Phone:</strong> +46 (0) 73 759 99 68</li>
      </ul>

      <h3 className="font-semibold mt-6">Refund Policy</h3>
      <p>
        For paid subscriptions, you may request a full refund within 30 days of purchase if you
        are not satisfied with the service. After 30 days, no refunds will be issued for
        subscription fees. SMS credit purchases are non-refundable under any circumstances.
      </p>

      <h3 className="font-semibold mt-6">Dispute Resolution</h3>
      <p>
        Any disputes arising out of or relating to these Terms shall be governed by the laws of
        Sweden. In the event of a dispute, the parties agree to first attempt to resolve the issue
        informally by contacting customer support. If the dispute cannot be resolved informally,
        the parties agree to submit to the exclusive jurisdiction of the courts of Sweden.
      </p>

      <h3 className="font-semibold mt-6">Cancellation Policy</h3>
      <p>
        You may cancel your subscription at any time. Cancellation takes effect at the end of your
        current billing period. No refunds will be issued for partial periods beyond the 30-day
        refund window. SMS credits are not cancellable once purchased.
      </p>
    </div>
  );
}
