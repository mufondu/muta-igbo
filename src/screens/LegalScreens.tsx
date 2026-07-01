// ─── Legal Screens: Terms, Privacy, Subscription ─────────────────────────────
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';

function LegalScreen({ title, onBack, children }: {
  title: string; onBack: () => void; children: React.ReactNode;
}) {
  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backText}>⬅</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        {children}
        <Text style={s.updated}>Last updated: June 2025</Text>
      </ScrollView>
    </View>
  );
}

function H2({ children }: { children: string }) {
  return <Text style={s.h2}>{children}</Text>;
}
function P({ children }: { children: React.ReactNode }) {
  return <Text style={s.p}>{children}</Text>;
}
function Li({ children }: { children: React.ReactNode }) {
  return <Text style={s.li}>{'\u2022'} {children}</Text>;
}

// ─── TERMS & CONDITIONS ───────────────────────────────────────────────────────
export function TermsScreen({ onBack }: { onBack: () => void }) {
  return (
    <LegalScreen title="Terms & Conditions" onBack={onBack}>
      <H2>1. Acceptance of Terms</H2>
      <P>By downloading, installing, or using Mụta Igbo ("the App"), you confirm that you are a parent or legal guardian and that you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the App. These terms apply to all users of the App across all platforms including iOS and Android.</P>

      <H2>2. Description of the App</H2>
      <P>Mụta Igbo is an educational language learning application designed to help children learn the Igbo language. The App covers the Anambra (Standard Igbo) dialect as its primary teaching language, with a dedicated Ogwashi-Ukwu Enuani dialect translator module. Content is structured using a proprietary progressive level system from Level 7A through Level 1A.</P>

      <H2>3. Eligibility and Parental Consent</H2>
      <P>The App is intended for use by children aged 3 and above, under the direct supervision of a parent or legal guardian. You must be at least 18 years old to create a profile, agree to these terms, and manage subscriptions. By creating a child profile, you confirm that you are that child's parent or legal guardian and that you consent to their use of the App under your supervision.</P>

      <H2>4. User Accounts and Profiles</H2>
      <P>The App does not require the creation of an online account. All profiles are stored locally on your device. You may create up to four child profiles. Each profile stores progress data including streaks, words learned, and quiz scores. Profile names and avatars are chosen by you as the parent. We are not responsible for profile data lost as a result of device loss, factory reset, or uninstallation of the App.</P>

      <H2>5. Subscription and In-App Purchases</H2>
      <P>Mụta Igbo offers a free tier and a Premium subscription. Free users have access to Levels 7A and 6A plus a selection of introductory content. Premium unlocks all levels and content. Subscription terms are detailed in the Subscription Terms document. All purchases are processed by Apple App Store or Google Play Store and are subject to their respective terms. We do not process or store payment information directly.</P>

      <H2>6. Permitted Use</H2>
      <P>You may use the App solely for personal, non-commercial educational purposes. You may not:</P>
      <Li>Reproduce, distribute, or resell any content from the App without prior written permission</Li>
      <Li>Attempt to extract, reverse engineer, or decompile the App or its content</Li>
      <Li>Use the App in any way that violates applicable laws or regulations</Li>
      <Li>Share your subscription access with individuals outside your immediate household</Li>

      <H2>7. Intellectual Property</H2>
      <P>All content within Mụta Igbo, including lesson data, Igbo vocabulary, audio recordings, illustrations, animations, the app name, and branding, is the intellectual property of Mụta Igbo and its content contributors. Igbo language content has been prepared in consultation with native speakers. The Ogwashi-Ukwu Enuani dialect content reflects community knowledge and is presented with cultural respect.</P>

      <H2>8. Accuracy of Language Content</H2>
      <P>We make reasonable efforts to ensure the accuracy of Igbo language content. However, Igbo is a tonal language with significant dialectal variation. The App primarily teaches Anambra (Central) Igbo alongside Ogwashi-Ukwu Enuani. We do not guarantee that all content reflects every regional variation. Users who identify inaccuracies are encouraged to contact us at content@mutaigbo.app.</P>

      <H2>9. Disclaimer of Warranties</H2>
      <P>The App is provided on an "as is" basis without warranties of any kind, express or implied. We do not warrant that the App will be uninterrupted, error-free, or free from technical issues. We are not responsible for any loss of progress data due to technical failure.</P>

      <H2>10. Limitation of Liability</H2>
      <P>To the fullest extent permitted by applicable law, Mụta Igbo shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App, including loss of data or any educational outcomes.</P>

      <H2>11. Changes to These Terms</H2>
      <P>We may update these Terms from time to time. We will notify users of material changes through the App. Continued use of the App after changes constitutes acceptance of the updated Terms.</P>

      <H2>12. Governing Law</H2>
      <P>These Terms are governed by and construed in accordance with applicable laws. Any disputes shall first be attempted to be resolved through good-faith negotiation.</P>

      <H2>13. Contact Us</H2>
      <P>For questions about these Terms, please contact us at: legal@mutaigbo.app</P>
    </LegalScreen>
  );
}

// ─── PRIVACY POLICY ───────────────────────────────────────────────────────────
export function PrivacyScreen({ onBack }: { onBack: () => void }) {
  return (
    <LegalScreen title="Privacy Policy" onBack={onBack}>
      <H2>Our Commitment to Privacy</H2>
      <P>Mụta Igbo is a children's educational app and we take privacy extremely seriously. This policy explains clearly what data we collect, how we use it, and the rights you have as a parent or guardian. We have designed the App to collect as little data as possible.</P>

      <H2>Who This Policy Applies To</H2>
      <P>This policy applies to all users of Mụta Igbo, including parents, guardians, and the children who use the App under their supervision. The App is directed at children aged 3 and above and is set up exclusively by adults.</P>

      <H2>What Data We Collect</H2>
      <P>We do not collect personal information. Specifically:</P>
      <Li>We do not collect names, email addresses, phone numbers, or location data</Li>
      <Li>We do not require account creation or online registration</Li>
      <Li>We do not collect device identifiers for advertising purposes</Li>
      <Li>We do not use advertising networks or third-party trackers</Li>
      <P>All data the App stores is saved locally on your device using AsyncStorage. This includes child profile names, avatars, learning progress, quiz scores, and streak counts. This data never leaves your device unless you back up your device through your operating system.</P>

      <H2>Children's Privacy (COPPA and GDPR-K)</H2>
      <P>We comply with the Children's Online Privacy Protection Act (COPPA) and applicable children's privacy regulations including GDPR-K. We do not knowingly collect personal information from children under 13. The App is structured so that an adult parent or guardian sets up and manages all profiles. No child is asked to provide personal information at any time within the App.</P>

      <H2>Audio Features</H2>
      <P>The "Say It Back" feature currently operates in demo mode. No audio is recorded, stored, or transmitted. Future versions may include on-device voice processing to support pronunciation feedback. Any such feature will be clearly marked, will function entirely on-device, and will not transmit voice data. This Privacy Policy will be updated before any audio capture feature is introduced.</P>

      <H2>Subscription and Payments</H2>
      <P>Subscription management and payment processing are handled entirely by Apple App Store or Google Play Store. We do not receive, store, or process your payment details. Your subscription status is communicated to the App by the respective store. We receive only a confirmation that a subscription is active or inactive, with no associated personal information.</P>

      <H2>Analytics</H2>
      <P>The current version of Mụta Igbo does not use any analytics or crash reporting services that transmit data externally. We may in a future version introduce privacy-preserving, anonymised aggregate analytics (for example, to understand which levels are most used) with no personally identifiable information. We will update this policy and notify users before doing so.</P>

      <H2>Data Sharing</H2>
      <P>We do not sell, rent, share, or disclose any user data to third parties. There are no advertising partners, data brokers, or third-party SDKs that access user data.</P>

      <H2>Data Retention and Deletion</H2>
      <P>All data is stored locally on your device. You can delete all App data at any time by going to Settings within the App and selecting "Reset All Progress." Uninstalling the App removes all stored data from your device. We do not retain any data on remote servers because we do not store any data remotely.</P>

      <H2>Security</H2>
      <P>Although all data remains on your device and no personal information is transmitted, we take reasonable steps in our development process to protect the integrity of locally stored data.</P>

      <H2>Your Rights</H2>
      <P>As a parent or guardian, you have the right to review any information stored about your child's use of the App, to have that information deleted, and to withdraw consent for their continued use of the App. All of these actions can be performed directly within the App through the Settings screen.</P>

      <H2>Changes to This Policy</H2>
      <P>We may update this Privacy Policy periodically. Material changes will be communicated through the App. The date at the bottom of this policy indicates when it was last updated.</P>

      <H2>Contact Us</H2>
      <P>For privacy questions, concerns, or requests, please contact us at: privacy@mutaigbo.app</P>
    </LegalScreen>
  );
}

// ─── SUBSCRIPTION TERMS ───────────────────────────────────────────────────────
export function SubscriptionTermsScreen({ onBack }: { onBack: () => void }) {
  return (
    <LegalScreen title="Subscription Terms" onBack={onBack}>
      <H2>Overview</H2>
      <P>Mụta Igbo offers a free tier and a Premium subscription. These Subscription Terms should be read alongside our full Terms and Conditions and Privacy Policy.</P>

      <H2>Free Tier</H2>
      <P>The free tier of Mụta Igbo gives access to:</P>
      <Li>Level 7A: Alphabet, vowels and consonants</Li>
      <Li>Level 6A: Greetings and useful phrases</Li>
      <Li>One introductory folktale</Li>
      <Li>The Ogwashi-Ukwu Enuani translator (limited questions)</Li>
      <Li>Basic quiz mode covering free-tier content</Li>
      <P>Free tier content is available without any payment and will remain available even if you do not subscribe.</P>

      <H2>Premium Subscription</H2>
      <P>Premium unlocks all content in the App, including:</P>
      <Li>All 7 learning levels (5A through 1A)</Li>
      <Li>Numbers and counting (Level 5A)</Li>
      <Li>Body parts and family (Level 4A)</Li>
      <Li>Animals and colours (Level 3A)</Li>
      <Li>Verbs, actions and tenses (Level 2A)</Li>
      <Li>Grammar, parts of speech, opposites and vocabulary (Level 1A)</Li>
      <Li>All folktales and Enuani stories</Li>
      <Li>Full quiz engine across all content</Li>
      <Li>Priority access to new content as it is released</Li>
      <Li>Native speaker audio recordings when available (coming soon)</Li>

      <H2>Pricing</H2>
      <P>Subscription pricing is as follows:</P>
      <Li>Monthly plan: $2.99 per month</Li>
      <Li>Yearly plan: $19.99 per year (equivalent to approximately $1.67 per month, saving approximately 44% compared to monthly billing)</Li>
      <P>Prices are displayed in your local currency at the point of purchase and may vary by region. Applicable taxes may apply depending on your location and are determined by your app store.</P>

      <H2>Billing and Renewal</H2>
      <P>Subscriptions are billed through your Apple App Store or Google Play Store account. Payment is charged to your account at confirmation of purchase. Subscriptions automatically renew at the end of each billing period (monthly or yearly) unless cancelled at least 24 hours before the renewal date. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscription through your App Store or Google Play account settings at any time.</P>

      <H2>Free Trials</H2>
      <P>We may from time to time offer free trial periods for the Premium subscription. If a free trial is offered, it will be clearly stated at the point of purchase. Any unused portion of a free trial period is forfeited when a paid subscription is purchased.</P>

      <H2>Cancellation</H2>
      <P>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. You will continue to have access to Premium content until the end of the period you have paid for. We do not provide partial refunds for unused subscription periods except as required by applicable law or app store policy.</P>

      <H2>Refunds</H2>
      <P>All subscription purchases are managed by Apple App Store or Google Play Store. Refund requests must be submitted directly to the relevant store. We do not process refunds directly. For Apple App Store purchases, visit reportaproblem.apple.com. For Google Play purchases, visit play.google.com/store/account.</P>

      <H2>Changes to Pricing</H2>
      <P>We reserve the right to change subscription pricing. Any price changes will be communicated to active subscribers in advance and will not affect the current billing period. Continued use of the subscription after a price change takes effect constitutes acceptance of the new price.</P>

      <H2>Family Sharing</H2>
      <P>A single Premium subscription covers all child profiles on one device (up to 4 profiles). The subscription is not intended for sharing across multiple households. Platform-level Family Sharing features (where available through your app store) are subject to that platform's own policies.</P>

      <H2>Contact Us</H2>
      <P>For questions about your subscription, please contact us at: support@mutaigbo.app</P>
    </LegalScreen>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLOR.forestDark,
    paddingVertical: 16, paddingHorizontal: SPACE.lg,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 20, color: COLOR.gold },
  headerTitle: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textCream, flex: 1 },
  scroll: { padding: SPACE.lg, paddingBottom: 60 },
  h2: {
    fontSize: FONT.md, fontWeight: '800', color: COLOR.forest,
    marginTop: SPACE.lg, marginBottom: SPACE.xs,
  },
  p: { fontSize: FONT.md, color: COLOR.textPrimary, lineHeight: 24, marginBottom: SPACE.sm },
  li: { fontSize: FONT.md, color: COLOR.textPrimary, lineHeight: 24, marginBottom: 4, paddingLeft: SPACE.sm },
  updated: {
    fontSize: FONT.xs, color: COLOR.textHint,
    textAlign: 'center', marginTop: SPACE.xl,
  },
});