import { LESSONS } from './constants'
import { Lesson, SupportedLang } from './types'

// Localized lesson content for the 4 new languages (Pidgin, Yoruba, Igbo, French).
// Extends the base LESSONS array with `_pcm/_yo/_ig/_fr` fields per lesson and
// per quiz question so the Academy can resolve content dynamically per language.
export const LOCALIZED_LESSONS: Lesson[] = LESSONS.map(l => {
  const byLang: Record<string, Partial<Lesson> & { quiz?: Lesson['quiz'] }> = {
    pcm: {
      title_pcm: 'Phishing & Social Engineering',
      description_pcm: 'Learn how to identify phishing wey dem dey use take target Nigerian bank customers through SMS, email, and phone call.',
      content_pcm: `Phishing na di most common cyberattack for Naija. Scammer dey pretend say dem be banks (GTBank, Zenith, Access, UBA), telcos (MTN, Airtel, Glo), and fintech (OPay, PalmPay, Moniepoint).

Signs of phishing:
1. Urgency: "Dem go suspend your account for 24 hours"
2. Dem dey ask for sensitive info: BVN, PIN, OTP, password
3. Links wey no match official domains
4. Grammar no good or strange sender numbers
5. Offers wey too good to be true (lottery win, free money)

Always verify through official channels. Bank NEVER go ask for your full PIN or OTP for phone or SMS.`,
      quiz: {
        ...l.quiz,
        questions: l.quiz.questions.map(q => ({
          ...q,
          text_pcm: '"GTBank" SMS dey ask you to click link to verify your BVN. Wetin you go do?',
          options_pcm: ['Click the link and put your BVN', 'Delete am and report di message', 'Forward to friends to warn dem', 'Reply to ask if e dey real'],
          explanation_pcm: 'Real banks no dey ask for BVN verification through SMS links. Delete am and report to your bank through official channels.'
        })),
      },
    },
    yo: {
      title_yo: 'Phishing àti Ẹ̀kọ́ Àwùjọ',
      description_yo: 'Kọ́ bí a ṣe ń mọ ìbágbé ọ̀nà tí àwọn oníjàǹbá ń gbà kọlu àwọn oníbàákẹ́dùn Nàìjíríà nípasẹ̀ SMS, iméèlì, àti ìpè.',
      content_yo: `Phishing ni ìkọlù orí ayélujára tí ó wọ́pọ̀ jùlọ ní Nàìjíríà. Àwọn oníjàǹbá ń dí ara wọn mọ́ bí àwọn báǹkì (GTBank, Zenith, Access, UBA), àwọn ilé iṣẹ́ tẹlifóònù (MTN, Airtel, Glo), àti fintech (OPay, PalmPay, Moniepoint).

Àmì phishing:
1. Ìkanjú: "A ó ṣéwọ́ àkọọ́lẹ̀ rẹ láàárín wákàtí 24"
2. Wọ́n ń béèrè fún ìsọfúnni pàtàkì: BVN, PIN, OTP, àwọn ọ̀rọ̀ àṣìṣe
3. Àwọn ọ̀nà àsopọ̀ tí kò bá àwọn òpó ojú òpó wọn mu
4. Gírámà tí kò dára tàbí àwọn nọ́ńbà òjíṣẹ́ àjèjì
5. Àwọn ìgbìmọ̀ tí ó dára jù (ìjàngbọ̀n lotiri, owó ọ̀fẹ́)

Ṣàyẹ̀wò nígbà gbogbo nípasẹ̀ àwọn ọ̀nà ìjọba. Àwọn báǹkì KÒ NÍ béèrè fún PIN rẹ kíkún tàbí OTP nípasẹ̀ tẹlifóònù tàbí SMS.`,
      quiz: {
        ...l.quiz,
        questions: l.quiz.questions.map(q => ({
          ...q,
          text_yo: 'SMS "GTBank" ń béèrè pé kí o tẹ ọ̀nà àsopọ̀ láti fi ìdí BVN rẹ múlẹ̀. Kí lo ṣe?',
          options_yo: ['Tẹ ọ̀nà àsopọ̀ kí o fi BVN rẹ sílẹ̀', 'Pa á rẹ́ kí o sì jabo ìránṣẹ́ náà', 'Fí fún àwọn ọ̀rẹ́ láti kìlò̀ fún wọn', 'Dáhùn láti béèrè bóyá ó tọ́'],
          explanation_yo: 'Àwọn báǹkì tòótọ́ kò ní béèrè fún ìfọ̀rọ̀wérọ̀ BVN nípasẹ̀ àwọn ọ̀nà àsopọ̀ SMS. Pa á rẹ́ kí o sì jabo fún báǹkì rẹ nípasẹ̀ àwọn ọ̀nà ìjọba.'
        })),
      },
    },
    ig: {
      title_ig: 'Phishing na Social Engineering',
      description_ig: 'Mụta otu esi amata aghụghọ phishing na-ezu ndị ahịa ụlọ akụ Naijiria n’SMS, email, na ekwentị.',
      content_ig: `Phishing bụ ọgụ ịntanetị kachasị na Naijiria. Ndị wayo na-eme onwe ha ka ha bụ ụlọ akụ (GTBank, Zenith, Access, UBA), telco (MTN, Airtel, Glo), na fintech (OPay, PalmPay, Moniepoint).

Akara phishing:
1. Mmechi: "A ga-akwụsị akaụntụ gị n'ime awa 24"
2. Ha na-arịọ ozi nzuzo: BVN, PIN, OTP, paswọọdụ
3. Njikọ ndị na-adabaghị na saịtị gọọmentị
4. Asụsụ na-adịghị mma ma ọ bụ nọmba onye na-eziga pụrụ iche
5. Onyinye ndị dị mma karịa ka ọ dị (lotiri, ego efu)

Na-ekwado mgbe niile site na ụzọ gọọmentị. Ụlọ akụ anaghị arịọ PIN gị zuru ezu ma ọ bụ OTP na ekwentị ma ọ bụ SMS.`,
      quiz: {
        ...l.quiz,
        questions: l.quiz.questions.map(q => ({
          ...q,
          text_ig: 'SMS "GTBank" na-arịọ gị ka ị pịa njikọ iji kwado BVN gị. Kedu ihe ị ga-eme?',
          options_ig: ['Pịa njikọ ahụ ma tinye BVN gị', 'Hichapụ ya ma kpesa ozi ahụ', 'Ziga ndị enyi gị ka ị dọọ ha aka na ntị', 'Zaghachi ịjụ ma ọ bụ ihe ziri ezi'],
          explanation_ig: 'Ụlọ akụ ziri ezi anaghị arịọ nkwenye BVN site na njikọ SMS. Hichapụ ya ma kpesa ụlọ akụ gị site na ụzọ gọọmentị.'
        })),
      },
    },
    fr: {
      title_fr: 'Phishing et Ingénierie Sociale',
      description_fr: 'Apprenez à repérer les tentatives de phishing ciblant les clients des banques nigérianes par SMS, e-mail et téléphone.',
      content_fr: `Le phishing est la cyberattaque la plus courante au Nigéria. Les fraudeurs se font passer pour des banques (GTBank, Zenith, Access, UBA), des opérateurs (MTN, Airtel, Glo) et des fintechs (OPay, PalmPay, Moniepoint).

Signes de phishing :
1. Urgence : "Votre compte sera suspendu sous 24 heures"
2. Demande d'informations sensibles : BVN, PIN, OTP, mots de passe
3. Liens suspects qui ne correspondent pas aux domaines officiels
4. Grammaire médiocre ou numéros d'expéditeur inhabituels
5. Offres trop belles pour être vraies (gains de loterie, argent gratuit)

Vérifiez toujours par les canaux officiels. Les banques ne demandent JAMAIS votre PIN complet ou votre OTP par téléphone ou SMS.`,
      quiz: {
        ...l.quiz,
        questions: l.quiz.questions.map(q => ({
          ...q,
          text_fr: 'Un SMS "GTBank" vous demande de cliquer sur un lien pour vérifier votre BVN. Que faites-vous ?',
          options_fr: ['Cliquer sur le lien et saisir mon BVN', 'Supprimer et signaler le message', 'Transférer à des amis pour les prévenir', "Répondre pour demander si c'est légitime"],
          explanation_fr: 'Les vraies banques ne demandent jamais de vérification BVN via des liens SMS. Supprimez et signalez à votre banque par les canaux officiels.'
        })),
      },
    },
  }

  const result: Lesson = { ...l }
  const mapped = byLang as Record<string, Partial<Lesson>>
  for (const lang of ['pcm', 'yo', 'ig', 'fr'] as SupportedLang[]) {
    const patch = mapped[lang]
    if (!patch) continue
    result[`title_${lang}`] = patch[`title_${lang}`]
    result[`description_${lang}`] = patch[`description_${lang}`]
    result[`content_${lang}`] = patch[`content_${lang}`]
    if (patch.quiz) result.quiz = patch.quiz
  }
  return result
})