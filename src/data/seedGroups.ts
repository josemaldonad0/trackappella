import { TrackappellaGroup } from '../types';

export const SEED_GROUPS: TrackappellaGroup[] = [
  {
    id: 'group-vocal-spectrum',
    code: 'SPECTRUM2026',
    name: 'Vocal Spectrum Rehearsal Vault',
    description: 'Exclusive contest set rehearsal multitracks and custom arranged tags directly from Vocal Spectrum.',
    membershipMode: 'non-moderated',
    createdAt: '2026-01-15T10:00:00.000Z',
    createdById: 'usr_demo_vance',
    creatorName: 'Alex Vance',
    bannerUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
    restrictedSongIds: ['sweet-and-lovely', 'darkness-on-the-delta'],
    members: [
      {
        userId: 'usr_demo_vance',
        displayName: 'Alex Vance',
        email: 'alex.vance@trackappella.app',
        role: 'admin',
        status: 'active',
        joinedDate: 'Jan 15, 2026',
        joinSource: 'Founder/Creator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        userId: 'usr_tim_waurick',
        displayName: 'Tim Waurick',
        email: 'tim@vocalproduction.de',
        role: 'admin',
        status: 'active',
        joinedDate: 'Jan 16, 2026',
        joinSource: 'Admin promotion',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        userId: 'usr_eric_dalbey',
        displayName: 'Eric Dalbey',
        email: 'eric@harmonymasters.org',
        role: 'member',
        status: 'active',
        joinedDate: 'Jan 20, 2026',
        joinSource: 'Invite: Vocal Spectrum Fall Rehearsals',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      {
        userId: 'usr_jonny_moroni',
        displayName: 'Jonny Moroni',
        email: 'jonny@quartetgold.com',
        role: 'member',
        status: 'active',
        joinedDate: 'Jan 22, 2026',
        joinSource: 'Invite: Vocal Spectrum Fall Rehearsals',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      }
    ],
    inviteLinks: [
      {
        id: 'inv_spec_01',
        token: 'vs-fall-rehearsals-2026',
        groupId: 'group-vocal-spectrum',
        groupCode: 'SPECTRUM2026',
        createdAt: '2026-08-01T12:00:00.000Z',
        expiresAt: '2026-11-01T12:00:00.000Z',
        expiryWindowLabel: '90 days',
        status: 'active',
        createdById: 'usr_demo_vance',
        createdByAdminName: 'Alex Vance',
        label: 'Vocal Spectrum Fall Rehearsals',
        usesCount: 14
      },
      {
        id: 'inv_spec_02',
        token: 'vs-summer-camp-expired',
        groupId: 'group-vocal-spectrum',
        groupCode: 'SPECTRUM2026',
        createdAt: '2026-06-01T12:00:00.000Z',
        expiresAt: '2026-07-01T12:00:00.000Z',
        expiryWindowLabel: '30 days',
        status: 'expired',
        createdById: 'usr_tim_waurick',
        createdByAdminName: 'Tim Waurick',
        label: 'Summer Harmony Camp 2026',
        usesCount: 28
      }
    ],
    joinRequests: []
  },
  {
    id: 'group-masters-harmony',
    code: 'MASTERS77',
    name: 'Masters of Harmony Chorus Set',
    description: 'Closed chorus rehearsal repertoire with 6-part SSATBB sectional split tracks and dynamic director notes.',
    membershipMode: 'moderated',
    createdAt: '2026-02-10T14:30:00.000Z',
    createdById: 'usr_alan_gordon',
    creatorName: 'Alan Gordon',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    restrictedSongIds: ['irish-blessing-6part'],
    members: [
      {
        userId: 'usr_alan_gordon',
        displayName: 'Alan Gordon',
        email: 'alan.director@mastersofharmony.org',
        role: 'admin',
        status: 'active',
        joinedDate: 'Feb 10, 2026',
        joinSource: 'Founder/Creator',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
      },
      {
        userId: 'usr_marcus_sterling',
        displayName: 'Marcus Sterling',
        email: 'marcus.bari@chorusworld.org',
        role: 'member',
        status: 'active',
        joinedDate: 'Feb 12, 2026',
        joinSource: 'Admin approval',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
      },
      {
        userId: 'usr_david_wright',
        displayName: 'David Wright',
        email: 'david.arranger@harmonymath.edu',
        role: 'admin',
        status: 'active',
        joinedDate: 'Feb 14, 2026',
        joinSource: 'Admin promotion',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
      }
    ],
    inviteLinks: [
      {
        id: 'inv_moh_01',
        token: 'moh-spring-sectionals-2026',
        groupId: 'group-masters-harmony',
        groupCode: 'MASTERS77',
        createdAt: '2026-08-15T09:00:00.000Z',
        expiresAt: '2026-10-15T09:00:00.000Z',
        expiryWindowLabel: '60 days',
        status: 'active',
        createdById: 'usr_alan_gordon',
        createdByAdminName: 'Alan Gordon',
        label: 'Sectional Audition Invite 2026',
        usesCount: 8
      },
      {
        id: 'inv_moh_02',
        token: 'moh-winter-retreat-revoked',
        groupId: 'group-masters-harmony',
        groupCode: 'MASTERS77',
        createdAt: '2026-07-01T10:00:00.000Z',
        expiresAt: '2026-12-01T10:00:00.000Z',
        expiryWindowLabel: '90 days',
        status: 'revoked',
        createdById: 'usr_alan_gordon',
        createdByAdminName: 'Alan Gordon',
        label: 'Early Retreat Portal Link',
        usesCount: 3
      }
    ],
    joinRequests: [
      {
        id: 'req_jordan_bennett',
        userId: 'usr_jordan_bennett',
        userEmail: 'jordan.tenor@gmail.com',
        displayName: 'Jordan Bennett',
        groupId: 'group-masters-harmony',
        groupName: 'Masters of Harmony Chorus Set',
        inviteLinkId: 'inv_moh_01',
        inviteLabel: 'Sectional Audition Invite 2026',
        requestTimestamp: '2026-09-02T16:20:00.000Z',
        status: 'pending'
      }
    ]
  },
  {
    id: 'group-sweet-adelines',
    code: 'SAIGOLD',
    name: 'Sweet Adelines Gold Medallion Hub',
    description: 'Treble barbershop SSAA showcase tags and competition tracks with overtone coaching guides.',
    membershipMode: 'moderated',
    createdAt: '2026-03-01T08:00:00.000Z',
    createdById: 'usr_claire_hart',
    creatorName: 'Claire Hart',
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    restrictedSongIds: ['cry-baby-treble'],
    members: [
      {
        userId: 'usr_claire_hart',
        displayName: 'Claire Hart',
        email: 'claire@sweetadelines.org',
        role: 'admin',
        status: 'active',
        joinedDate: 'Mar 01, 2026',
        joinSource: 'Founder/Creator',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      }
    ],
    inviteLinks: [
      {
        id: 'inv_sai_01',
        token: 'sai-gold-fall-2026',
        groupId: 'group-sweet-adelines',
        groupCode: 'SAIGOLD',
        createdAt: '2026-08-20T11:00:00.000Z',
        expiresAt: '2026-11-20T11:00:00.000Z',
        expiryWindowLabel: '90 days',
        status: 'active',
        createdById: 'usr_claire_hart',
        createdByAdminName: 'Claire Hart',
        label: 'Fall 2026 chorus invite',
        usesCount: 5
      }
    ],
    joinRequests: []
  }
];
