export interface PointObj {
  x: number;
  y: number;
}

export interface BirdObj {
  seasons: {
    prebreeding_migration?: BirdSeasonEntry;
    postbreeding_migration?: BirdSeasonEntry;
    nonbreeding?: BirdSeasonEntry;
    breeding?: BirdSeasonEntry;
  };
  common_name: string;
}

export interface BirdSeasonEntry {
  season: string;
  region: string;
  x: number;
  y: number;
}
