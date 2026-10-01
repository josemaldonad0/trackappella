import { Song, GroupCatalog } from '../types';

export const SEED_GROUP_CATALOGS: GroupCatalog[] = [
  {
    id: 'group-vocal-spectrum',
    name: 'Vocal Spectrum Rehearsal Vault',
    accessCode: 'SPECTRUM2026',
    organization: 'BHS International Champions',
    description: 'Exclusive contest set rehearsal multitracks and custom arranged tags directly from Vocal Spectrum.',
    songIds: ['sweet-and-lovely', 'darkness-on-the-delta'],
    bannerUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
    isUnlocked: false
  },
  {
    id: 'group-masters-harmony',
    name: 'Masters of Harmony Chorus Set',
    accessCode: 'MASTERS77',
    organization: 'Masters of Harmony Chorus',
    description: 'Closed chorus rehearsal repertoire with 6-part SSATBB sectional split tracks and dynamic director notes.',
    songIds: ['irish-blessing-6part'],
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    isUnlocked: false
  },
  {
    id: 'group-sweet-adelines',
    name: 'Sweet Adelines Gold Medallion Hub',
    accessCode: 'SAIGOLD',
    organization: 'Sweet Adelines International',
    description: 'Treble barbershop SSAA showcase tags and competition tracks with overtone coaching guides.',
    songIds: ['cry-baby-treble'],
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    isUnlocked: false
  }
];

export const SEED_SONGS: Song[] = [
  {
    id: 'i-hold-your-hand-in-mine',
    title: 'I Hold Your Hand in Mine',
    subtitle: '4-Part Barbershop-Adjacent Satire Classic',
    performerName: 'Eleventh Hour',
    arranger: 'Jose Maldonado',
    tracksBy: 'Eleventh Hour',
    composer: 'Tom Lehrer',
    otherAttributions: 'Music and Lyrics by Tom Lehrer',
    genre: 'Barbershop / Satire',
    type: 'song',
    assetType: 'audio',
    voicing: 'TLBB',
    durationSeconds: 153,
    baseKey: 'F',
    tempoBpm: 88,
    description: 'Try your hand at this 4-part arrangement of the Tom Lehrer classic, in barbershop-adjacent style.',
    whyTonightCopy: 'Perform this classic Tom Lehrer gem arranged by Jose Maldonado and recorded by Eleventh Hour. Rich 4-part TLBB stems in the key of F.',
    tags: ['Eleventh Hour', 'Jose Maldonado', 'Tom Lehrer', 'TLBB', 'Barbershop', 'Audio Stems', 'Score Included'],
    difficulty: 'Intermediate',
    status: 'ready',
    visibility: 'public',
    singAlongCount: 960,
    popularityVotes: 412,
    allowPublicAuditions: true,
    allowExternalDistribution: true,
    isTrending: true,
    isNewThisWeek: true,
    isFeaturedSpotlight: true,
    partner: {
      name: 'Eleventh Hour',
      tagline: 'Vocal Quartet & A Cappella Ensembles',
      badge: 'Official Artist',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80'
    },
    parts: [
      {
        id: 'tenor',
        name: 'Tenor',
        shortName: 'Ten',
        range: 'A3 - F5',
        color: '#D9A7B4',
        description: 'Tenor vocal stem',
        audioUrl: '/audio/trk1/hold_newTenor.mp3',
        notes: [
          { time: 1.5, duration: 1.2, noteName: 'A4', midi: 69, lyric: 'I' },
          { time: 2.8, duration: 1.4, noteName: 'C5', midi: 72, lyric: 'hold' },
          { time: 4.3, duration: 1.8, noteName: 'F5', midi: 77, lyric: 'your' },
          { time: 6.2, duration: 2.0, noteName: 'C5', midi: 72, lyric: 'hand' },
          { time: 8.3, duration: 1.6, noteName: 'Bb4', midi: 70, lyric: 'in' },
          { time: 10.0, duration: 2.5, noteName: 'A4', midi: 69, lyric: 'mine,' },
          { time: 13.0, duration: 1.8, noteName: 'G4', midi: 67, lyric: 'dear,' },
          { time: 15.0, duration: 1.4, noteName: 'A4', midi: 69, lyric: 'I' },
          { time: 16.5, duration: 1.6, noteName: 'Bb4', midi: 70, lyric: 'press' },
          { time: 18.2, duration: 1.8, noteName: 'C5', midi: 72, lyric: 'it' },
          { time: 20.1, duration: 2.2, noteName: 'D5', midi: 74, lyric: 'to' },
          { time: 22.4, duration: 2.0, noteName: 'C5', midi: 72, lyric: 'my' },
          { time: 24.5, duration: 6.5, noteName: 'F5', midi: 77, lyric: 'lips!' }
        ]
      },
      {
        id: 'lead',
        name: 'Lead',
        shortName: 'Ld',
        range: 'F3 - C5',
        color: '#D9AF8D',
        description: 'Lead vocal melody stem',
        audioUrl: '/audio/trk1/hold_newLead.mp3',
        notes: [
          { time: 1.5, duration: 1.2, noteName: 'F4', midi: 65, lyric: 'I' },
          { time: 2.8, duration: 1.4, noteName: 'A4', midi: 69, lyric: 'hold' },
          { time: 4.3, duration: 1.8, noteName: 'C5', midi: 72, lyric: 'your' },
          { time: 6.2, duration: 2.0, noteName: 'A4', midi: 69, lyric: 'hand' },
          { time: 8.3, duration: 1.6, noteName: 'G4', midi: 67, lyric: 'in' },
          { time: 10.0, duration: 2.5, noteName: 'F4', midi: 65, lyric: 'mine,' },
          { time: 13.0, duration: 1.8, noteName: 'E4', midi: 64, lyric: 'dear,' },
          { time: 15.0, duration: 1.4, noteName: 'F4', midi: 65, lyric: 'I' },
          { time: 16.5, duration: 1.6, noteName: 'G4', midi: 67, lyric: 'press' },
          { time: 18.2, duration: 1.8, noteName: 'A4', midi: 69, lyric: 'it' },
          { time: 20.1, duration: 2.2, noteName: 'Bb4', midi: 70, lyric: 'to' },
          { time: 22.4, duration: 2.0, noteName: 'C5', midi: 72, lyric: 'my' },
          { time: 24.5, duration: 6.5, noteName: 'F4', midi: 65, lyric: 'lips!' }
        ]
      },
      {
        id: 'baritone',
        name: 'Baritone',
        shortName: 'Bari',
        range: 'C3 - F4',
        color: '#9EBCAB',
        description: 'Baritone vocal stem',
        audioUrl: '/audio/trk1/hold_newBari.mp3',
        notes: [
          { time: 1.5, duration: 1.2, noteName: 'C4', midi: 60, lyric: 'I' },
          { time: 2.8, duration: 1.4, noteName: 'F4', midi: 65, lyric: 'hold' },
          { time: 4.3, duration: 1.8, noteName: 'F4', midi: 65, lyric: 'your' },
          { time: 6.2, duration: 2.0, noteName: 'Eb4', midi: 63, lyric: 'hand' },
          { time: 8.3, duration: 1.6, noteName: 'D4', midi: 62, lyric: 'in' },
          { time: 10.0, duration: 2.5, noteName: 'C4', midi: 60, lyric: 'mine,' },
          { time: 13.0, duration: 1.8, noteName: 'C4', midi: 60, lyric: 'dear,' },
          { time: 15.0, duration: 1.4, noteName: 'C4', midi: 60, lyric: 'I' },
          { time: 16.5, duration: 1.6, noteName: 'Eb4', midi: 63, lyric: 'press' },
          { time: 18.2, duration: 1.8, noteName: 'F4', midi: 65, lyric: 'it' },
          { time: 20.1, duration: 2.2, noteName: 'G4', midi: 67, lyric: 'to' },
          { time: 22.4, duration: 2.0, noteName: 'A4', midi: 69, lyric: 'my' },
          { time: 24.5, duration: 6.5, noteName: 'A4', midi: 69, lyric: 'lips!' }
        ]
      },
      {
        id: 'bass',
        name: 'Bass',
        shortName: 'Bass',
        range: 'F2 - C4',
        color: '#B7A1CC',
        description: 'Bass vocal stem',
        audioUrl: '/audio/trk1/hold_newBass.mp3',
        notes: [
          { time: 1.5, duration: 1.2, noteName: 'F2', midi: 41, lyric: 'I' },
          { time: 2.8, duration: 1.4, noteName: 'F2', midi: 41, lyric: 'hold' },
          { time: 4.3, duration: 1.8, noteName: 'F3', midi: 53, lyric: 'your' },
          { time: 6.2, duration: 2.0, noteName: 'Bb2', midi: 46, lyric: 'hand' },
          { time: 8.3, duration: 1.6, noteName: 'C3', midi: 48, lyric: 'in' },
          { time: 10.0, duration: 2.5, noteName: 'F2', midi: 41, lyric: 'mine,' },
          { time: 13.0, duration: 1.8, noteName: 'C3', midi: 48, lyric: 'dear,' },
          { time: 15.0, duration: 1.4, noteName: 'F2', midi: 41, lyric: 'I' },
          { time: 16.5, duration: 1.6, noteName: 'Bb2', midi: 46, lyric: 'press' },
          { time: 18.2, duration: 1.8, noteName: 'F2', midi: 41, lyric: 'it' },
          { time: 20.1, duration: 2.2, noteName: 'Bb2', midi: 46, lyric: 'to' },
          { time: 22.4, duration: 2.0, noteName: 'C3', midi: 48, lyric: 'my' },
          { time: 24.5, duration: 6.5, noteName: 'F2', midi: 41, lyric: 'lips!' }
        ]
      }
    ],
    rehearsalMarks: [
      { id: 'bip-cue', label: 'Sync Bip Cue', time: 0 },
      { id: 'verse-entry', label: 'Verse Entry', time: 1.5 },
      { id: 'chorus-turn', label: 'Secondary Dominant', time: 13.0 },
      { id: 'cadence-ring', label: 'Barbershop Tag Cadence', time: 22.4 }
    ],
    lyrics: [
      { startTime: 0, endTime: 1.4, text: '[Sync Bip Cue & Breath]' },
      { startTime: 1.5, endTime: 12.9, text: 'I hold your hand in mine, dear, I press it to my lips...' },
      { startTime: 13.0, endTime: 22.3, text: 'I take a healthy bite from your dainty fingertips...' },
      { startTime: 22.4, endTime: 32.0, text: 'I hold your hand in mine!' }
    ],
    assets: {
      artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      audioStems: {
        tenor: '/audio/trk1/hold_newTenor.mp3',
        lead: '/audio/trk1/hold_newLead.mp3',
        baritone: '/audio/trk1/hold_newBari.mp3',
        bass: '/audio/trk1/hold_newBass.mp3'
      },
      chart: {
        fullScorePdfUrl: '/audio/trk1/hold_hand_2026.pdf'
      }
    }
  },
  {
    id: 'sweet-and-lovely',
    title: 'Sweet and Lovely',
    subtitle: 'Classic Barbershop Championship Tag',
    performerName: 'Vocal Spectrum',
    arranger: 'Greg Lyne & David Wright',
    tracksBy: 'Tim Waurick',
    composer: 'Gus Arnheim, Charles N. Daniels, Harry Tobias',
    genre: 'Barbershop',
    type: 'tag',
    assetType: 'audio',
    voicing: 'TTBB',
    durationSeconds: 43,
    baseKey: 'Eb',
    tempoBpm: 68,
    description: 'The quintessential barbershop tag featuring a soaring high tenor post, chromatic baritone weave, and a magnificent expanding 7th chord that rings overtones throughout the hall.',
    whyTonightCopy: 'Sing along with 2006 BHS World Champions. Master the legendary tenor post and bass root lock.',
    tags: ['Barbershop', 'Championship Tag', 'Tenor Post', 'Close Harmony'],
    difficulty: 'Intermediate',
    status: 'ready',
    visibility: 'public',
    singAlongCount: 1420,
    popularityVotes: 342,
    allowPublicAuditions: true,
    allowExternalDistribution: true,
    isFeaturedSpotlight: true,
    isFanFavorite: true,
    isTrending: true,
    contributorName: 'David Wright Repertoire',
    partner: {
      name: 'Vocal Spectrum',
      tagline: '2006 BHS International Quartet Champions',
      badge: 'Championship Quartet',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    parts: [
      {
        id: 'tenor',
        name: 'Tenor',
        audioUrl: '/audio/sweet-and-lovely/track_tenor.wav',
        shortName: 'Ten',
        range: 'Eb4 - G5',
        color: '#D9A7B4',
        description: 'Light, ringing falsetto above the lead melody, crowning the final overtone ring.',
        notes: [
          { time: 0, duration: 4.5, noteName: 'G4', midi: 67, lyric: 'Sweet' },
          { time: 4.5, duration: 4.0, noteName: 'Ab4', midi: 68, lyric: 'and' },
          { time: 8.5, duration: 4.5, noteName: 'Bb4', midi: 70, lyric: 'love-' },
          { time: 13.0, duration: 5.0, noteName: 'C5', midi: 72, lyric: 'ly,' },
          { time: 18.0, duration: 5.5, noteName: 'Db5', midi: 73, lyric: 'that' },
          { time: 23.5, duration: 6.0, noteName: 'Eb5', midi: 75, lyric: 'is' },
          { time: 29.5, duration: 13.5, noteName: 'G5', midi: 79, lyric: 'you!' }
        ]
      },
      {
        id: 'lead',
        name: 'Lead',
        audioUrl: '/audio/sweet-and-lovely/track_lead.wav',
        shortName: 'Ld',
        range: 'Eb3 - Eb4',
        color: '#D9AF8D',
        description: 'The golden melodic line and emotive storytelling core of the quartet.',
        notes: [
          { time: 0, duration: 4.5, noteName: 'Eb4', midi: 63, lyric: 'Sweet' },
          { time: 4.5, duration: 4.0, noteName: 'F4', midi: 65, lyric: 'and' },
          { time: 8.5, duration: 4.5, noteName: 'G4', midi: 67, lyric: 'love-' },
          { time: 13.0, duration: 5.0, noteName: 'Ab4', midi: 68, lyric: 'ly,' },
          { time: 18.0, duration: 5.5, noteName: 'Bb4', midi: 70, lyric: 'that' },
          { time: 23.5, duration: 6.0, noteName: 'C4', midi: 60, lyric: 'is' },
          { time: 29.5, duration: 13.5, noteName: 'Eb4', midi: 63, lyric: 'you!' }
        ]
      },
      {
        id: 'baritone',
        name: 'Baritone',
        audioUrl: '/audio/sweet-and-lovely/track_baritone.wav',
        shortName: 'Bari',
        range: 'Bb2 - C4',
        color: '#9EBCAB',
        description: 'The harmonic glue filling crucial color tones and locking the famous barbershop 7ths.',
        notes: [
          { time: 0, duration: 4.5, noteName: 'Bb3', midi: 58, lyric: 'Sweet' },
          { time: 4.5, duration: 4.0, noteName: 'C4', midi: 60, lyric: 'and' },
          { time: 8.5, duration: 4.5, noteName: 'Db4', midi: 61, lyric: 'love-' },
          { time: 13.0, duration: 5.0, noteName: 'Eb4', midi: 63, lyric: 'ly,' },
          { time: 18.0, duration: 5.5, noteName: 'F4', midi: 65, lyric: 'that' },
          { time: 23.5, duration: 6.0, noteName: 'Ab3', midi: 56, lyric: 'is' },
          { time: 29.5, duration: 13.5, noteName: 'Bb3', midi: 58, lyric: 'you!' }
        ]
      },
      {
        id: 'bass',
        name: 'Bass',
        audioUrl: '/audio/sweet-and-lovely/track_bass.wav',
        shortName: 'Bass',
        range: 'Eb2 - Bb3',
        color: '#B7A1CC',
        description: 'Deep resonant foundation anchoring the entire acoustic chord pyramid.',
        notes: [
          { time: 0, duration: 4.5, noteName: 'Eb3', midi: 51, lyric: 'Sweet' },
          { time: 4.5, duration: 4.0, noteName: 'Eb3', midi: 51, lyric: 'and' },
          { time: 8.5, duration: 4.5, noteName: 'Eb3', midi: 51, lyric: 'love-' },
          { time: 13.0, duration: 5.0, noteName: 'Ab2', midi: 44, lyric: 'ly,' },
          { time: 18.0, duration: 5.5, noteName: 'Bb2', midi: 46, lyric: 'that' },
          { time: 23.5, duration: 6.0, noteName: 'C3', midi: 48, lyric: 'is' },
          { time: 29.5, duration: 13.5, noteName: 'Eb2', midi: 39, lyric: 'you!' }
        ]
      }
    ],
    rehearsalMarks: [
      { id: 'm1', label: 'Start', time: 0 },
      { id: 'm2', label: 'Lead Turn', time: 13.0 },
      { id: 'm3', label: 'High Tenor Post', time: 29.5 }
    ],
    lyrics: [
      { startTime: 0, endTime: 13.0, text: 'Sweet and lovely,' },
      { startTime: 13.0, endTime: 29.5, text: 'That is you...' },
      { startTime: 29.5, endTime: 43.0, text: 'Sweet and lovely, that is you!' }
    ],
    assets: {
      artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      audioStems: {
        tenor: '/audio/sweet-and-lovely/track_tenor.wav',
        lead: '/audio/sweet-and-lovely/track_lead.wav',
        baritone: '/audio/sweet-and-lovely/track_baritone.wav',
        bass: '/audio/sweet-and-lovely/track_bass.wav',
      },
      fullMixAudioUrl: '/audio/sweet-and-lovely/full_mix.wav',
      chart: {
        scoreData: {
          keySignature: 'Eb',
          timeSignature: '4/4',
          tempo: 68,
          clefs: { treble: ['tenor', 'lead'], bass: ['baritone', 'bass'] },
          measures: [
            {
              measureNumber: 1,
              timeSignature: '4/4',
              parts: {
                tenor: [{ pitch: 'G4', duration: 4, lyric: 'Sweet' }],
                lead: [{ pitch: 'Eb4', duration: 4, lyric: 'Sweet' }],
                baritone: [{ pitch: 'Bb3', duration: 4, lyric: 'Sweet' }],
                bass: [{ pitch: 'Eb3', duration: 4, lyric: 'Sweet' }]
              }
            },
            {
              measureNumber: 2,
              timeSignature: '4/4',
              parts: {
                tenor: [{ pitch: 'Ab4', duration: 2, lyric: 'and' }, { pitch: 'Bb4', duration: 2, lyric: 'love-' }],
                lead: [{ pitch: 'F4', duration: 2, lyric: 'and' }, { pitch: 'G4', duration: 2, lyric: 'love-' }],
                baritone: [{ pitch: 'C4', duration: 2, lyric: 'and' }, { pitch: 'Db4', duration: 2, lyric: 'love-' }],
                bass: [{ pitch: 'Eb3', duration: 2, lyric: 'and' }, { pitch: 'Eb3', duration: 2, lyric: 'love-' }]
              }
            },
            {
              measureNumber: 3,
              timeSignature: '4/4',
              parts: {
                tenor: [{ pitch: 'C5', duration: 4, lyric: 'ly,' }],
                lead: [{ pitch: 'Ab4', duration: 4, lyric: 'ly,' }],
                baritone: [{ pitch: 'Eb4', duration: 4, lyric: 'ly,' }],
                bass: [{ pitch: 'Ab2', duration: 4, lyric: 'ly,' }]
              }
            },
            {
              measureNumber: 4,
              timeSignature: '4/4',
              parts: {
                tenor: [{ pitch: 'G5', duration: 4, lyric: 'you!' }],
                lead: [{ pitch: 'Eb4', duration: 4, lyric: 'you!' }],
                baritone: [{ pitch: 'Bb3', duration: 4, lyric: 'you!' }],
                bass: [{ pitch: 'Eb2', duration: 4, lyric: 'you!' }]
              }
            }
          ]
        }
      }
    }
  },
  {
    id: 'darkness-on-the-delta',
    title: 'Darkness on the Delta',
    subtitle: 'Swinging Southern Barbershop Tag',
    performerName: 'Ringmasters',
    arranger: 'Aaron Dale',
    tracksBy: 'Rasmus Krigström',
    composer: 'Jerry Levinson, Al Neiburg, Marty Symes',
    genre: 'Jazz / Barbershop',
    type: 'tag',
    assetType: 'audio',
    voicing: 'TTBB',
    durationSeconds: 38,
    baseKey: 'F',
    tempoBpm: 84,
    description: 'A punchy, syncopated jazz-influenced tag with lightning bass runs and crisp ringing swipe chords at the turnaround.',
    whyTonightCopy: 'Sing along with 2012 International Champions Ringmasters. Perfect for practicing upbeat rhythmic locks.',
    tags: ['Ringmasters', 'Jazz Harmony', 'Swipe Tag', 'Championship'],
    difficulty: 'Advanced',
    status: 'ready',
    visibility: 'public',
    singAlongCount: 980,
    popularityVotes: 215,
    allowPublicAuditions: true,
    allowExternalDistribution: true,
    isFeaturedSpotlight: true,
    isTrending: true,
    partner: {
      name: 'Ringmasters',
      tagline: '2012 International BHS Quartet Champions (Sweden)',
      badge: 'Championship Quartet',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
    },
    parts: [
      {
        id: 'tenor',
        name: 'Tenor',
        audioUrl: '/audio/darkness-on-the-delta/track_tenor.wav',
        shortName: 'Ten',
        range: 'F4 - A5',
        color: '#D9A7B4',
        notes: [
          { time: 0, duration: 4, noteName: 'A4', midi: 69, lyric: 'When' },
          { time: 4, duration: 4, noteName: 'Bb4', midi: 70, lyric: 'dark-' },
          { time: 8, duration: 4, noteName: 'C5', midi: 72, lyric: 'ness' },
          { time: 12, duration: 4, noteName: 'D5', midi: 74, lyric: 'falls,' },
          { time: 16, duration: 6, noteName: 'F5', midi: 77, lyric: 'on the' },
          { time: 22, duration: 16, noteName: 'A5', midi: 81, lyric: 'del-ta!' }
        ]
      },
      {
        id: 'lead',
        name: 'Lead',
        audioUrl: '/audio/darkness-on-the-delta/track_lead.wav',
        shortName: 'Ld',
        range: 'F3 - F4',
        color: '#D9AF8D',
        notes: [
          { time: 0, duration: 4, noteName: 'F4', midi: 65, lyric: 'When' },
          { time: 4, duration: 4, noteName: 'G4', midi: 67, lyric: 'dark-' },
          { time: 8, duration: 4, noteName: 'A4', midi: 69, lyric: 'ness' },
          { time: 12, duration: 4, noteName: 'Bb4', midi: 70, lyric: 'falls,' },
          { time: 16, duration: 6, noteName: 'C4', midi: 60, lyric: 'on the' },
          { time: 22, duration: 16, noteName: 'F4', midi: 65, lyric: 'del-ta!' }
        ]
      },
      {
        id: 'baritone',
        name: 'Baritone',
        audioUrl: '/audio/darkness-on-the-delta/track_baritone.wav',
        shortName: 'Bari',
        range: 'C3 - D4',
        color: '#9EBCAB',
        notes: [
          { time: 0, duration: 4, noteName: 'C4', midi: 60, lyric: 'When' },
          { time: 4, duration: 4, noteName: 'Db4', midi: 61, lyric: 'dark-' },
          { time: 8, duration: 4, noteName: 'Eb4', midi: 63, lyric: 'ness' },
          { time: 12, duration: 4, noteName: 'F4', midi: 65, lyric: 'falls,' },
          { time: 16, duration: 6, noteName: 'A3', midi: 57, lyric: 'on the' },
          { time: 22, duration: 16, noteName: 'C4', midi: 60, lyric: 'del-ta!' }
        ]
      },
      {
        id: 'bass',
        name: 'Bass',
        audioUrl: '/audio/darkness-on-the-delta/track_bass.wav',
        shortName: 'Bass',
        range: 'F2 - C3',
        color: '#B7A1CC',
        notes: [
          { time: 0, duration: 4, noteName: 'F3', midi: 53, lyric: 'When' },
          { time: 4, duration: 4, noteName: 'Eb3', midi: 51, lyric: 'dark-' },
          { time: 8, duration: 4, noteName: 'D3', midi: 50, lyric: 'ness' },
          { time: 12, duration: 4, noteName: 'Bb2', midi: 46, lyric: 'falls,' },
          { time: 16, duration: 6, noteName: 'C3', midi: 48, lyric: 'on the' },
          { time: 22, duration: 16, noteName: 'F2', midi: 41, lyric: 'del-ta!' }
        ]
      }
    ],
    rehearsalMarks: [
      { id: 'm1', label: 'Intro', time: 0 },
      { id: 'm2', label: 'The Swipe', time: 16 }
    ],
    lyrics: [
      { startTime: 0, endTime: 16, text: 'When darkness falls...' },
      { startTime: 16, endTime: 38, text: 'On the deep and muddy Delta!' }
    ],
    assets: {
      artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      audioStems: {
        tenor: '/audio/darkness-on-the-delta/track_tenor.wav',
        lead: '/audio/darkness-on-the-delta/track_lead.wav',
        baritone: '/audio/darkness-on-the-delta/track_baritone.wav',
        bass: '/audio/darkness-on-the-delta/track_bass.wav',
      },
      fullMixAudioUrl: '/audio/darkness-on-the-delta/full_mix.wav',
      chart: {}
    }
  },
  {
    id: 'java-jive-satb',
    title: 'Java Jive',
    subtitle: 'Classic Contemporary Vocal Jazz (SATB)',
    performerName: 'The Manhattan Harmony Vocals',
    arranger: 'Kirby Shaw',
    tracksBy: 'Kirby Shaw Studio',
    composer: 'Milton Drake & Ben Oakland',
    genre: 'Vocal Jazz / A Cappella',
    type: 'song',
    assetType: 'audio',
    voicing: 'SATB',
    durationSeconds: 118,
    baseKey: 'C',
    tempoBpm: 104,
    description: 'Bouncy, caffeinated vocal jazz arrangement with tight chromatic harmony, syncopated scats, and distinct Soprano, Alto, Tenor, and Bass solo breaks.',
    whyTonightCopy: 'A crowd favorite staple across vocal jazz festivals worldwide.',
    tags: ['Vocal Jazz', 'SATB', 'Full Song', 'Coffee', 'Contemporary'],
    difficulty: 'Intermediate',
    status: 'ready',
    visibility: 'public',
    singAlongCount: 810,
    popularityVotes: 188,
    allowPublicAuditions: true,
    allowExternalDistribution: true,
    isFanFavorite: true,
    isFeaturedSpotlight: true,
    contributorName: 'Kirby Shaw Arrangements',
    partner: {
      name: 'Vocal Jazz Guild',
      tagline: 'International Contemporary Vocal Arrangers',
      badge: 'Featured Arranger',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80'
    },
    parts: [
      { id: 'soprano', name: 'Soprano', shortName: 'Sop', range: 'C4 - A5', color: '#D9A7B4', notes: [{ time: 0, duration: 4, noteName: 'E4', midi: 64, lyric: 'I love coffee' }, { time: 4, duration: 4, noteName: 'G4', midi: 67, lyric: 'I love tea' }] },
      { id: 'alto', name: 'Alto', shortName: 'Alt', range: 'G3 - E5', color: '#9EBCAB', notes: [{ time: 0, duration: 4, noteName: 'C4', midi: 60, lyric: 'I love coffee' }, { time: 4, duration: 4, noteName: 'E4', midi: 64, lyric: 'I love tea' }] },
      { id: 'tenor', name: 'Tenor', shortName: 'Ten', range: 'C3 - G4', color: '#D9A7B4', notes: [{ time: 0, duration: 4, noteName: 'G3', midi: 55, lyric: 'I love coffee' }, { time: 4, duration: 4, noteName: 'C4', midi: 60, lyric: 'I love tea' }] },
      { id: 'bass', name: 'Bass', shortName: 'Bass', range: 'C2 - C4', color: '#B7A1CC', notes: [{ time: 0, duration: 4, noteName: 'C3', midi: 48, lyric: 'I love coffee' }, { time: 4, duration: 4, noteName: 'G2', midi: 43, lyric: 'I love tea' }] }
    ],
    rehearsalMarks: [
      { id: 'm1', label: 'Intro Jive', time: 0 },
      { id: 'm2', label: 'Coffee Cup Hook', time: 24 }
    ],
    lyrics: [
      { startTime: 0, endTime: 24, text: 'I love coffee, I love tea...' },
      { startTime: 24, endTime: 60, text: 'I love the java jive and it loves me!' }
    ],
    assets: {
      artwork: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
      audioStems: {
        soprano: '/audio/java-jive-satb/track_soprano.wav',
        alto: '/audio/java-jive-satb/track_alto.wav',
        tenor: '/audio/java-jive-satb/track_tenor.wav',
        bass: '/audio/java-jive-satb/track_bass.wav',
      },
      fullMixAudioUrl: '/audio/java-jive-satb/full_mix.wav',
      chart: {}
    }
  },
  {
    id: 'shenandoah-video',
    title: 'Shenandoah (Synchronized Video Headshots)',
    subtitle: 'Lush American Folk Song (TTBB Video Multitrack)',
    performerName: 'Main Street Quartet',
    arranger: 'Kevin Keller',
    tracksBy: 'Tony DeRosa',
    composer: 'American Traditional Folk',
    genre: 'Folk / Barbershop',
    type: 'song',
    assetType: 'video',
    voicing: 'TTBB',
    durationSeconds: 145,
    baseKey: 'Eb',
    tempoBpm: 62,
    description: 'Full Video Multitrack Arrangement featuring individual headshot-style synchronized performance tracks for Tenor, Lead, Baritone, and Bass with high dynamic expression.',
    whyTonightCopy: 'Watch and sing face-to-face with video Singer Tracks.',
    tags: ['Video Multitrack', 'TTBB', 'Shenandoah', 'Folk', 'Full Song'],
    difficulty: 'Advanced',
    status: 'ready',
    visibility: 'public',
    singAlongCount: 1650,
    popularityVotes: 495,
    allowPublicAuditions: true,
    allowExternalDistribution: true,
    isFeaturedSpotlight: true,
    isTrending: true,
    isFanFavorite: true,
    partner: {
      name: 'Main Street Quartet',
      tagline: '2017 BHS International Champions',
      badge: 'Championship Quartet',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    parts: [
      { id: 'tenor', name: 'Tenor', shortName: 'Ten', range: 'Eb4 - Ab5', color: '#D9A7B4', notes: [{ time: 0, duration: 6, noteName: 'G4', midi: 67, lyric: 'Oh Shenandoah' }] },
      { id: 'lead', name: 'Lead', shortName: 'Ld', range: 'Eb3 - F4', color: '#D9AF8D', notes: [{ time: 0, duration: 6, noteName: 'Eb4', midi: 63, lyric: 'Oh Shenandoah' }] },
      { id: 'baritone', name: 'Baritone', shortName: 'Bari', range: 'Bb2 - Eb4', color: '#9EBCAB', notes: [{ time: 0, duration: 6, noteName: 'Bb3', midi: 58, lyric: 'Oh Shenandoah' }] },
      { id: 'bass', name: 'Bass', shortName: 'Bass', range: 'Eb2 - C3', color: '#B7A1CC', notes: [{ time: 0, duration: 6, noteName: 'Eb3', midi: 51, lyric: 'Oh Shenandoah' }] }
    ],
    rehearsalMarks: [
      { id: 'm1', label: 'River Opening', time: 0 },
      { id: 'm2', label: 'Rolling River Peak', time: 42 }
    ],
    lyrics: [
      { startTime: 0, endTime: 42, text: 'Oh Shenandoah, I long to hear you...' },
      { startTime: 42, endTime: 90, text: 'Away, I\'m bound away, across the wide Missouri!' }
    ],
    assets: {
      artwork: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
      audioStems: {
        tenor: '/audio/shenandoah-video/track_tenor.wav',
        lead: '/audio/shenandoah-video/track_lead.wav',
        baritone: '/audio/shenandoah-video/track_baritone.wav',
        bass: '/audio/shenandoah-video/track_bass.wav',
      },
      fullMixAudioUrl: '/audio/shenandoah-video/full_mix.wav',
      chart: {}
    }
  },
  {
    id: 'cry-baby-treble',
    title: 'Cry Baby (Treble SSAA)',
    subtitle: 'Sweet Adelines Showcase Harmony Tag',
    performerName: 'The Buzz Quartet',
    arranger: 'Lynne Smith',
    tracksBy: 'Debbie Cleveland',
    composer: 'Garnet Mimms & Bert Berns',
    genre: 'Soul / Treble Barbershop',
    type: 'tag',
    assetType: 'audio',
    voicing: 'SSAA',
    durationSeconds: 36,
    baseKey: 'Ab',
    tempoBpm: 72,
    description: 'Soul-stirring treble a cappella tag with rich bell-tones, expansive overtones, and brilliant soaring Soprano 1 leads.',
    whyTonightCopy: 'Contributed by Sweet Adelines International Gold Quartet. Explore treble voicings with pristine overtone resonance.',
    tags: ['SSAA', 'Sweet Adelines', 'Treble Harmony', 'Soul Tag'],
    difficulty: 'Intermediate',
    status: 'ready',
    visibility: 'public',
    singAlongCount: 750,
    popularityVotes: 160,
    allowPublicAuditions: true,
    allowExternalDistribution: true,
    isNewThisWeek: true,
    isTrending: true,
    partner: {
      name: 'Sweet Adelines Hub',
      tagline: 'International Women’s Barbershop & A Cappella Network',
      badge: 'Official Artist',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    parts: [
      {
        id: 'tenor',
        name: 'Tenor (Soprano 1)',
        audioUrl: '/audio/cry-baby-treble/track_tenor.wav',
        shortName: 'Ten/S1',
        range: 'Ab4 - C6',
        color: '#D9A7B4',
        notes: [
          { time: 0, duration: 4, noteName: 'C5', midi: 72, lyric: 'Cry' },
          { time: 4, duration: 4, noteName: 'Db5', midi: 73, lyric: 'ba-' },
          { time: 8, duration: 4, noteName: 'Eb5', midi: 75, lyric: 'by,' },
          { time: 12, duration: 6, noteName: 'Ab5', midi: 80, lyric: 'cry' },
          { time: 18, duration: 18, noteName: 'C6', midi: 84, lyric: 'now!' }
        ]
      },
      {
        id: 'lead',
        name: 'Lead (Soprano 2)',
        audioUrl: '/audio/cry-baby-treble/track_lead.wav',
        shortName: 'Ld/S2',
        range: 'Ab3 - Ab4',
        color: '#D9AF8D',
        notes: [
          { time: 0, duration: 4, noteName: 'Ab4', midi: 68, lyric: 'Cry' },
          { time: 4, duration: 4, noteName: 'Bb4', midi: 70, lyric: 'ba-' },
          { time: 8, duration: 4, noteName: 'C5', midi: 72, lyric: 'by,' },
          { time: 12, duration: 6, noteName: 'Eb4', midi: 63, lyric: 'cry' },
          { time: 18, duration: 18, noteName: 'Ab4', midi: 68, lyric: 'now!' }
        ]
      },
      {
        id: 'baritone',
        name: 'Baritone (Alto 1)',
        audioUrl: '/audio/cry-baby-treble/track_baritone.wav',
        shortName: 'Bari/A1',
        range: 'Eb3 - Eb4',
        color: '#9EBCAB',
        notes: [
          { time: 0, duration: 4, noteName: 'Eb4', midi: 63, lyric: 'Cry' },
          { time: 4, duration: 4, noteName: 'F4', midi: 65, lyric: 'ba-' },
          { time: 8, duration: 4, noteName: 'Gb4', midi: 66, lyric: 'by,' },
          { time: 12, duration: 6, noteName: 'C4', midi: 60, lyric: 'cry' },
          { time: 18, duration: 18, noteName: 'Eb4', midi: 63, lyric: 'now!' }
        ]
      },
      {
        id: 'bass',
        name: 'Bass (Alto 2)',
        audioUrl: '/audio/cry-baby-treble/track_bass.wav',
        shortName: 'Bass/A2',
        range: 'Ab2 - C4',
        color: '#B7A1CC',
        notes: [
          { time: 0, duration: 4, noteName: 'Ab3', midi: 56, lyric: 'Cry' },
          { time: 4, duration: 4, noteName: 'Gb3', midi: 54, lyric: 'ba-' },
          { time: 8, duration: 4, noteName: 'F3', midi: 53, lyric: 'by,' },
          { time: 12, duration: 6, noteName: 'Db3', midi: 49, lyric: 'cry' },
          { time: 18, duration: 18, noteName: 'Ab2', midi: 44, lyric: 'now!' }
        ]
      }
    ],
    rehearsalMarks: [
      { id: 'm1', label: 'Cry Baby Entry', time: 0 },
      { id: 'm2', label: 'Ring Bell Tone', time: 18 }
    ],
    lyrics: [
      { startTime: 0, endTime: 12, text: 'Cry baby, don\'t cry...' },
      { startTime: 12, endTime: 36, text: 'Cry baby, cry right now!' }
    ],
    assets: {
      artwork: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
      audioStems: {
        tenor: '/audio/cry-baby-treble/track_tenor.wav',
        lead: '/audio/cry-baby-treble/track_lead.wav',
        baritone: '/audio/cry-baby-treble/track_baritone.wav',
        bass: '/audio/cry-baby-treble/track_bass.wav',
      },
      fullMixAudioUrl: '/audio/cry-baby-treble/full_mix.wav',
      chart: {}
    }
  },
  {
    id: 'irish-blessing-6part',
    title: 'An Irish Blessing (6-Part Choral)',
    subtitle: 'Choral Rehearsal Stems (SSATBB)',
    performerName: 'Masters of Harmony Chorus',
    arranger: 'James E. Moore Jr.',
    tracksBy: 'Masters of Harmony Choral Lab',
    composer: 'Traditional Celtic',
    genre: 'Choral / Sacred',
    type: 'song',
    assetType: 'audio',
    voicing: 'SSATBB',
    durationSeconds: 58,
    baseKey: 'D',
    tempoBpm: 60,
    description: 'Members-Only Chorus Rehearsal multitrack featuring 6 distinct sectional voice parts with synchronized Latin-Celtic choral score.',
    whyTonightCopy: 'Private rehearsal archive for choir sectionals. May the road rise up to meet you.',
    tags: ['Choral', 'SSATBB', '6-Part', 'Rehearsal Vault', 'Members Only'],
    difficulty: 'Advanced',
    status: 'ready',
    visibility: 'members-only',
    groupAccessCode: 'MASTERS77',
    singAlongCount: 530,
    popularityVotes: 140,
    allowPublicAuditions: false,
    allowExternalDistribution: false,
    isNewThisWeek: true,
    partner: {
      name: 'Masters of Harmony',
      tagline: '9-Time International Chorus Champions',
      badge: 'Chorus Partner',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&auto=format&fit=crop&q=80'
    },
    parts: [
      { id: 's1', name: 'Soprano 1 / High Tenor', shortName: 'S1', range: 'D4 - A5', color: '#D9A7B4', notes: [{ time: 0, duration: 8, noteName: 'F#4', midi: 66, lyric: 'May the' }, { time: 8, duration: 8, noteName: 'A4', midi: 69, lyric: 'road rise' }] },
      { id: 's2', name: 'Soprano 2 / Tenor', shortName: 'S2', range: 'D4 - F#5', color: '#D9AF8D', notes: [{ time: 0, duration: 8, noteName: 'D4', midi: 62, lyric: 'May the' }, { time: 8, duration: 8, noteName: 'F#4', midi: 66, lyric: 'road rise' }] },
      { id: 'a1', name: 'Alto 1 / Lead 1', shortName: 'A1', range: 'A3 - D5', color: '#9EBCAB', notes: [{ time: 0, duration: 8, noteName: 'A3', midi: 57, lyric: 'May the' }, { time: 8, duration: 8, noteName: 'D4', midi: 62, lyric: 'road rise' }] },
      { id: 'a2', name: 'Alto 2 / Baritone', shortName: 'A2', range: 'F#3 - B4', color: '#9EBCAB', notes: [{ time: 0, duration: 8, noteName: 'F#3', midi: 54, lyric: 'May the' }, { time: 8, duration: 8, noteName: 'B3', midi: 59, lyric: 'road rise' }] },
      { id: 'b1', name: 'Bass 1 (Baritone Bass)', shortName: 'B1', range: 'D3 - G3', color: '#B7A1CC', notes: [{ time: 0, duration: 8, noteName: 'D3', midi: 50, lyric: 'May the' }, { time: 8, duration: 8, noteName: 'G3', midi: 55, lyric: 'road rise' }] },
      { id: 'b2', name: 'Bass 2 (Deep Bass)', shortName: 'B2', range: 'D2 - D3', color: '#B7A1CC', notes: [{ time: 0, duration: 8, noteName: 'D2', midi: 38, lyric: 'May the' }, { time: 8, duration: 8, noteName: 'D3', midi: 50, lyric: 'road rise' }] }
    ],
    rehearsalMarks: [
      { id: 'm1', label: 'Blessing Opening', time: 0 },
      { id: 'm2', label: 'Wind At Your Back', time: 28 }
    ],
    lyrics: [
      { startTime: 0, endTime: 28, text: 'May the road rise to meet you...' },
      { startTime: 28, endTime: 58, text: 'May the wind be ever at your back...' }
    ],
    assets: {
      artwork: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80',
      audioStems: {
        s1: '/audio/irish-blessing-6part/track_s1.wav',
        s2: '/audio/irish-blessing-6part/track_s2.wav',
        a1: '/audio/irish-blessing-6part/track_a1.wav',
        a2: '/audio/irish-blessing-6part/track_a2.wav',
        b1: '/audio/irish-blessing-6part/track_b1.wav',
        b2: '/audio/irish-blessing-6part/track_b2.wav',
      },
      fullMixAudioUrl: '/audio/irish-blessing-6part/full_mix.wav',
      chart: {}
    }
  },
  {
    id: 'cruella-de-vil',
    title: 'Cruella De Vil',
    subtitle: 'High-Energy Barbershop Humor Showstopper',
    performerName: 'Signature Quartet',
    arranger: 'David Wright',
    tracksBy: 'Tim Waurick',
    composer: 'Mel Leven',
    genre: 'Barbershop / Showtune',
    type: 'song',
    assetType: 'audio',
    voicing: 'TTBB',
    durationSeconds: 132,
    baseKey: 'F',
    tempoBpm: 92,
    description: 'Championship competition showstopper arranged by David Wright with wicked chromatic swipes, vocal brass simulations, and a roaring tag.',
    whyTonightCopy: 'Sing along with 2019 BHS International Champions Signature. Master tricky syncopations and dynamic character acting.',
    tags: ['Signature', 'Championship', 'Showtune', 'TTBB', 'David Wright'],
    difficulty: 'Virtuoso',
    status: 'ready',
    visibility: 'public',
    singAlongCount: 1820,
    popularityVotes: 512,
    allowPublicAuditions: true,
    allowExternalDistribution: true,
    isTrending: true,
    isNewThisWeek: true,
    isFanFavorite: true,
    partner: {
      name: 'Signature Quartet',
      tagline: '2019 BHS International Quartet Champions',
      badge: 'Championship Quartet',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&auto=format&fit=crop&q=80'
    },
    parts: [
      { id: 'tenor', name: 'Tenor', shortName: 'Ten', range: 'F4 - Bb5', color: '#D9A7B4', notes: [{ time: 0, duration: 4, noteName: 'C5', midi: 72, lyric: 'Cruella' }] },
      { id: 'lead', name: 'Lead', shortName: 'Ld', range: 'F3 - G4', color: '#D9AF8D', notes: [{ time: 0, duration: 4, noteName: 'F4', midi: 65, lyric: 'Cruella' }] },
      { id: 'baritone', name: 'Baritone', shortName: 'Bari', range: 'C3 - Eb4', color: '#9EBCAB', notes: [{ time: 0, duration: 4, noteName: 'A3', midi: 57, lyric: 'Cruella' }] },
      { id: 'bass', name: 'Bass', shortName: 'Bass', range: 'F2 - D3', color: '#B7A1CC', notes: [{ time: 0, duration: 4, noteName: 'F2', midi: 41, lyric: 'Cruella' }] }
    ],
    rehearsalMarks: [
      { id: 'm1', label: 'Vamp In', time: 0 },
      { id: 'm2', label: 'If She Doesn\'t Scare You', time: 35 },
      { id: 'm3', label: 'Grand Tag Finish', time: 105 }
    ],
    lyrics: [
      { startTime: 0, endTime: 35, text: 'Cruella De Vil, Cruella De Vil...' },
      { startTime: 35, endTime: 105, text: 'If she doesn\'t scare you, no evil thing will!' },
      { startTime: 105, endTime: 132, text: 'Look out for Cruella De Vil!' }
    ],
    assets: {
      artwork: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&auto=format&fit=crop&q=80',
      audioStems: {
        tenor: '/audio/cruella-de-vil/track_tenor.wav',
        lead: '/audio/cruella-de-vil/track_lead.wav',
        baritone: '/audio/cruella-de-vil/track_baritone.wav',
        bass: '/audio/cruella-de-vil/track_bass.wav',
      },
      fullMixAudioUrl: '/audio/cruella-de-vil/full_mix.wav',
      chart: {}
    }
  },
  {
    id: 'over-the-rainbow-ssaa',
    title: 'Over the Rainbow (Treble SSAA)',
    subtitle: 'Lush Contemporary Treble Masterwork',
    performerName: 'Sirens of Sound',
    arranger: 'Lynne Smith & Deke Sharon',
    tracksBy: 'Debbie Cleveland Stems',
    composer: 'Harold Arlen & E.Y. Harburg',
    genre: 'Ballad / Contemporary A Cappella',
    type: 'song',
    assetType: 'audio',
    voicing: 'SSAA',
    durationSeconds: 154,
    baseKey: 'Eb',
    tempoBpm: 64,
    description: 'An ethereal treble arrangement with cascading vocal arpeggios, warm inner-voice clusters, and an unforgettable octave leap climax.',
    whyTonightCopy: 'Featured Sweet Adelines Treble showcase selection with rich harmonic resonance.',
    tags: ['SSAA', 'Treble Masterwork', 'Ballad', 'Sweet Adelines', 'Full Song'],
    difficulty: 'Advanced',
    status: 'ready',
    visibility: 'public',
    singAlongCount: 1340,
    popularityVotes: 388,
    allowPublicAuditions: true,
    allowExternalDistribution: true,
    isFanFavorite: true,
    isNewThisWeek: true,
    partner: {
      name: 'Sweet Adelines Hub',
      tagline: 'International Women’s Barbershop & A Cappella Network',
      badge: 'Official Artist',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    parts: [
      { id: 'tenor', name: 'Soprano 1', shortName: 'S1', range: 'Eb4 - Ab5', color: '#D9A7B4', notes: [{ time: 0, duration: 6, noteName: 'Eb5', midi: 75, lyric: 'Somewhere' }] },
      { id: 'lead', name: 'Soprano 2', shortName: 'S2', range: 'Bb3 - Eb5', color: '#D9AF8D', notes: [{ time: 0, duration: 6, noteName: 'Bb4', midi: 70, lyric: 'Somewhere' }] },
      { id: 'baritone', name: 'Alto 1', shortName: 'A1', range: 'G3 - C5', color: '#9EBCAB', notes: [{ time: 0, duration: 6, noteName: 'G4', midi: 67, lyric: 'Somewhere' }] },
      { id: 'bass', name: 'Alto 2', shortName: 'A2', range: 'Eb3 - Ab4', color: '#B7A1CC', notes: [{ time: 0, duration: 6, noteName: 'Eb3', midi: 51, lyric: 'Somewhere' }] }
    ],
    rehearsalMarks: [
      { id: 'm1', label: 'Arpeggio Intro', time: 0 },
      { id: 'm2', label: 'Rainbow Peak', time: 70 }
    ],
    lyrics: [
      { startTime: 0, endTime: 70, text: 'Somewhere over the rainbow, way up high...' },
      { startTime: 70, endTime: 154, text: 'And the dreams that you dare to dream really do come true.' }
    ],
    assets: {
      artwork: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
      audioStems: {
        tenor: '/audio/over-the-rainbow-ssaa/track_tenor.wav',
        lead: '/audio/over-the-rainbow-ssaa/track_lead.wav',
        baritone: '/audio/over-the-rainbow-ssaa/track_baritone.wav',
        bass: '/audio/over-the-rainbow-ssaa/track_bass.wav',
      },
      fullMixAudioUrl: '/audio/over-the-rainbow-ssaa/full_mix.wav',
      chart: {}
    }
  },
  {
    id: 'heart-of-my-heart',
    title: 'Heart of My Heart Tag',
    subtitle: 'Timeless Barbershop Heritage Ring',
    performerName: 'The Gas House Gang',
    arranger: 'Traditional / Joe Liles',
    tracksBy: 'Kipp Buckner',
    composer: 'Ben Ryan',
    genre: 'Barbershop',
    type: 'tag',
    assetType: 'audio',
    voicing: 'TTBB',
    durationSeconds: 34,
    baseKey: 'Ab',
    tempoBpm: 66,
    description: 'The golden classic barbershop tag known by every barbershopper worldwide. Crisp chords, pure vowel alignment, and warm nostalgia.',
    whyTonightCopy: 'The perfect ice-breaker tag for any impromptu quartet circle.',
    tags: ['Classic Tag', 'Heritage', 'TTBB', 'Fan Favorite', 'Gas House Gang'],
    difficulty: 'Easy',
    status: 'ready',
    visibility: 'public',
    singAlongCount: 2200,
    popularityVotes: 640,
    allowPublicAuditions: true,
    allowExternalDistribution: true,
    isFanFavorite: true,
    isFeaturedSpotlight: true,
    partner: {
      name: 'Gas House Gang Heritage',
      tagline: '1993 BHS International Champions',
      badge: 'Championship Quartet',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    parts: [
      { id: 'tenor', name: 'Tenor', shortName: 'Ten', range: 'Ab4 - F5', color: '#D9A7B4', notes: [{ time: 0, duration: 4, noteName: 'C5', midi: 72, lyric: 'Heart' }] },
      { id: 'lead', name: 'Lead', shortName: 'Ld', range: 'Ab3 - Ab4', color: '#D9AF8D', notes: [{ time: 0, duration: 4, noteName: 'Ab4', midi: 68, lyric: 'Heart' }] },
      { id: 'baritone', name: 'Baritone', shortName: 'Bari', range: 'Eb3 - Eb4', color: '#9EBCAB', notes: [{ time: 0, duration: 4, noteName: 'Eb4', midi: 63, lyric: 'Heart' }] },
      { id: 'bass', name: 'Bass', shortName: 'Bass', range: 'Ab2 - C3', color: '#B7A1CC', notes: [{ time: 0, duration: 4, noteName: 'Ab2', midi: 44, lyric: 'Heart' }] }
    ],
    rehearsalMarks: [
      { id: 'm1', label: 'Tag Start', time: 0 },
      { id: 'm2', label: 'Final Ringing 7th', time: 20 }
    ],
    lyrics: [
      { startTime: 0, endTime: 20, text: 'Heart of my heart, I love that melody...' },
      { startTime: 20, endTime: 34, text: 'Heart of my heart, alone!' }
    ],
    assets: {
      artwork: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
      audioStems: {
        tenor: '/audio/heart-of-my-heart/track_tenor.wav',
        lead: '/audio/heart-of-my-heart/track_lead.wav',
        baritone: '/audio/heart-of-my-heart/track_baritone.wav',
        bass: '/audio/heart-of-my-heart/track_bass.wav',
      },
      fullMixAudioUrl: '/audio/heart-of-my-heart/full_mix.wav',
      chart: {}
    }
  }
];
