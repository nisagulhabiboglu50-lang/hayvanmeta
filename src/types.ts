export interface LifecycleStage {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Animal {
  id: string;
  name: string;
  scientificName: string;
  icon: string;
  stages: LifecycleStage[];
}
