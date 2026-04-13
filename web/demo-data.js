window.OSL_DEMO_DATA = {
  home: {
    hero_title: "Open Space Layer",
    hero_subtitle: "Search official NASA mission evidence or enter through mission control.",
    suggested_topics: [
      "Earthrise",
      "communications blackout",
      "closest approach",
      "Earthset",
      "official sources only"
    ],
    missions: [
      {
        slug: "artemis-ii",
        name: "Artemis II",
        status: "completed",
        mission_type: "crewed lunar flyby",
        summary: "Demo-mode Artemis II dataset derived from official-source-style mission updates and excerpt-level evidence wiring."
      }
    ]
  },
  missions: [
    {
      id: "mission-artemis-ii",
      slug: "artemis-ii",
      name: "Artemis II",
      agency: "NASA",
      mission_type: "crewed lunar flyby",
      status: "completed",
      summary: "Demo-mode Artemis II dataset derived from official-source-style mission updates and excerpt-level evidence wiring.",
      documents_count: 1,
      events_count: 5,
      media_count: 1
    }
  ],
  missionTimelines: {
    "artemis-ii": [
      {
        id: "event-blackout",
        event_type: "communications_blackout_begin",
        title: "Communications Blackout",
        start_time: "2026-04-06T19:00:00Z",
        summary: "During the lunar flyby, Orion passed behind the Moon, creating a planned communications blackout as line-of-sight to Earth was interrupted.",
        evidence_class: "confirmed",
        confidence: 0.98,
        evidence_presentation: { evidence_class: "confirmed", display_label: "Confirmed", display_marker: "" }
      },
      {
        id: "event-earthset",
        event_type: "earthset_observed",
        title: "Earthset Observed",
        start_time: "2026-04-06T19:08:00Z",
        summary: "The crew observed Earthset as Orion moved behind the Moon.",
        evidence_class: "confirmed",
        confidence: 0.97,
        evidence_presentation: { evidence_class: "confirmed", display_label: "Confirmed", display_marker: "" }
      },
      {
        id: "event-closest-approach",
        event_type: "closest_approach",
        title: "Closest Approach",
        start_time: "2026-04-06T19:12:00Z",
        summary: "At closest approach, Orion passed about 4,067 miles above the lunar surface.",
        evidence_class: "confirmed",
        confidence: 0.99,
        evidence_presentation: { evidence_class: "confirmed", display_label: "Confirmed", display_marker: "" }
      },
      {
        id: "event-earthrise",
        event_type: "earthrise_observed",
        title: "Earthrise Observed",
        start_time: "2026-04-06T19:44:00Z",
        summary: "After the blackout window, the crew observed Earthrise as communications were re-established.",
        evidence_class: "confirmed",
        confidence: 0.97,
        evidence_presentation: { evidence_class: "confirmed", display_label: "Confirmed", display_marker: "" }
      },
      {
        id: "event-observation-complete",
        event_type: "observation_window_complete",
        title: "Observation Window Complete",
        start_time: "2026-04-06T20:10:00Z",
        summary: "The observation window concluded and the return phase continued toward Earth.",
        evidence_class: "interpreted",
        confidence: 0.83,
        derivation_note: "Interpretive summary based on official-source sequence. The source supports the phase completion, but this event title is normalized by the system.",
        evidence_presentation: {
          evidence_class: "interpreted",
          display_label: "Interpreted",
          display_marker: "**",
          disclosure_title: "Interpretive summary based on official sources",
          disclosure_note: "This view preserves the underlying official facts while normalizing the title and phrasing for search and replay." 
        }
      }
    ]
  },
  events: {
    "event-blackout": {
      id: "event-blackout",
      event_type: "communications_blackout_begin",
      title: "Communications Blackout",
      start_time: "2026-04-06T19:00:00Z",
      summary: "During the lunar flyby, Orion passed behind the Moon, creating a planned communications blackout as line-of-sight to Earth was interrupted.",
      evidence_class: "confirmed",
      confidence: 0.98,
      derivation_note: null,
      evidence_presentation: { evidence_class: "confirmed", display_label: "Confirmed", display_marker: "" },
      evidence_links: [
        {
          relation_type: "supports",
          support_strength: 0.98,
          excerpt: {
            id: "excerpt-blackout",
            excerpt_index: 1,
            excerpt_text: "During the lunar flyby, Orion passed behind the Moon, creating a planned communications blackout as line-of-sight to Earth was interrupted.",
            section_label: "Mission update",
            page_number: null
          }
        }
      ]
    },
    "event-earthset": {
      id: "event-earthset",
      event_type: "earthset_observed",
      title: "Earthset Observed",
      start_time: "2026-04-06T19:08:00Z",
      summary: "The crew observed Earthset as Orion moved behind the Moon.",
      evidence_class: "confirmed",
      confidence: 0.97,
      derivation_note: null,
      evidence_presentation: { evidence_class: "confirmed", display_label: "Confirmed", display_marker: "" },
      evidence_links: [
        {
          relation_type: "supports",
          support_strength: 0.97,
          excerpt: {
            id: "excerpt-earthset",
            excerpt_index: 2,
            excerpt_text: "The crew observed Earthset as Orion moved behind the Moon.",
            section_label: "Mission update",
            page_number: null
          }
        }
      ]
    },
    "event-closest-approach": {
      id: "event-closest-approach",
      event_type: "closest_approach",
      title: "Closest Approach",
      start_time: "2026-04-06T19:12:00Z",
      summary: "At closest approach, Orion passed about 4,067 miles above the lunar surface.",
      evidence_class: "confirmed",
      confidence: 0.99,
      derivation_note: null,
      evidence_presentation: { evidence_class: "confirmed", display_label: "Confirmed", display_marker: "" },
      evidence_links: [
        {
          relation_type: "supports",
          support_strength: 0.99,
          excerpt: {
            id: "excerpt-closest-approach",
            excerpt_index: 3,
            excerpt_text: "At closest approach, Orion passed about 4,067 miles above the lunar surface.",
            section_label: "Mission update",
            page_number: null
          }
        }
      ]
    },
    "event-earthrise": {
      id: "event-earthrise",
      event_type: "earthrise_observed",
      title: "Earthrise Observed",
      start_time: "2026-04-06T19:44:00Z",
      summary: "After the blackout window, the crew observed Earthrise as communications were re-established.",
      evidence_class: "confirmed",
      confidence: 0.97,
      derivation_note: null,
      evidence_presentation: { evidence_class: "confirmed", display_label: "Confirmed", display_marker: "" },
      evidence_links: [
        {
          relation_type: "supports",
          support_strength: 0.97,
          excerpt: {
            id: "excerpt-earthrise",
            excerpt_index: 4,
            excerpt_text: "After the blackout window, the crew observed Earthrise as communications were re-established.",
            section_label: "Mission update",
            page_number: null
          }
        }
      ]
    },
    "event-observation-complete": {
      id: "event-observation-complete",
      event_type: "observation_window_complete",
      title: "Observation Window Complete",
      start_time: "2026-04-06T20:10:00Z",
      summary: "The observation window concluded and the return phase continued toward Earth.",
      evidence_class: "interpreted",
      confidence: 0.83,
      derivation_note: "Interpretive summary based on official-source sequence. The source supports the phase completion, but this event title is normalized by the system.",
      evidence_presentation: {
        evidence_class: "interpreted",
        display_label: "Interpreted",
        display_marker: "**",
        disclosure_title: "Interpretive summary based on official sources",
        disclosure_note: "This view preserves the underlying official facts while normalizing the title and phrasing for search and replay." 
      },
      evidence_links: [
        {
          relation_type: "supports",
          support_strength: 0.83,
          excerpt: {
            id: "excerpt-observation-complete",
            excerpt_index: 5,
            excerpt_text: "The observation window concluded and the return phase continued toward Earth.",
            section_label: "Mission update",
            page_number: null
          }
        }
      ]
    }
  },
  documents: {
    "doc-artemis-seed": {
      id: "doc-artemis-seed",
      slug: "artemis-ii-flight-day-seed",
      title: "Artemis II Flight Day Seed Update",
      source_type: "blog_post",
      source_url: "https://www.nasa.gov/example/artemis-ii-flight-day-seed",
      publisher: "NASA",
      published_at: "2026-04-06T19:00:00Z",
      raw_text: "NASA’s Artemis II mission is the first crewed mission under Artemis and will send four astronauts around the Moon aboard Orion. During the lunar flyby, Orion passed behind the Moon, creating a planned communications blackout as line-of-sight to Earth was interrupted. The crew observed Earthset as Orion moved behind the Moon. At closest approach, Orion passed about 4,067 miles above the lunar surface. After the blackout window, the crew observed Earthrise as communications were re-established. The observation window concluded and the return phase continued toward Earth.",
      excerpts: [
        { id: "excerpt-intro", excerpt_index: 0, excerpt_text: "NASA’s Artemis II mission is the first crewed mission under Artemis and will send four astronauts around the Moon aboard Orion.", section_label: "Mission update", page_number: null },
        { id: "excerpt-blackout", excerpt_index: 1, excerpt_text: "During the lunar flyby, Orion passed behind the Moon, creating a planned communications blackout as line-of-sight to Earth was interrupted.", section_label: "Mission update", page_number: null },
        { id: "excerpt-earthset", excerpt_index: 2, excerpt_text: "The crew observed Earthset as Orion moved behind the Moon.", section_label: "Mission update", page_number: null },
        { id: "excerpt-closest-approach", excerpt_index: 3, excerpt_text: "At closest approach, Orion passed about 4,067 miles above the lunar surface.", section_label: "Mission update", page_number: null },
        { id: "excerpt-earthrise", excerpt_index: 4, excerpt_text: "After the blackout window, the crew observed Earthrise as communications were re-established.", section_label: "Mission update", page_number: null },
        { id: "excerpt-observation-complete", excerpt_index: 5, excerpt_text: "The observation window concluded and the return phase continued toward Earth.", section_label: "Mission update", page_number: null }
      ]
    }
  }
};
