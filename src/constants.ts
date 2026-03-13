import { Animal } from './types';

export const ANIMALS: Animal[] = [
  {
    id: 'butterfly',
    name: 'Kelebek',
    scientificName: 'Lepidoptera',
    icon: '🦋',
    stages: [
      {
        id: 'egg',
        name: 'Yumurta',
        description: 'Dişi kelebek yumurtalarını bir yaprağın üzerine bırakır. Bu süreç yaşam döngüsünün başlangıcıdır.',
        imageUrl: 'https://images.unsplash.com/photo-1621848229003-886915d9069d?auto=format&fit=crop&q=80&w=800',
      },
      {
        id: 'larva',
        name: 'Tırtıl (Larva)',
        description: 'Yumurtadan çıkan tırtıl sürekli beslenir ve büyür. Derisini birkaç kez değiştirir.',
        imageUrl: 'https://picsum.photos/seed/caterpillar/800/600',
      },
      {
        id: 'pupa',
        name: 'Krizalit (Pupa)',
        description: 'Tırtıl kendini bir koza içine hapseder. Bu aşamada vücudu tamamen yeniden yapılanır.',
        imageUrl: 'https://picsum.photos/seed/chrysalis/800/600',
      },
      {
        id: 'adult',
        name: 'Yetişkin Kelebek',
        description: 'Kozadan çıkan kelebek kanatlarını kurutur ve uçmaya başlar. Artık döngü tamamlanmıştır.',
        imageUrl: 'https://picsum.photos/seed/monarch-butterfly/800/600',
      },
    ],
  },
  {
    id: 'frog',
    name: 'Kurbağa',
    scientificName: 'Anura',
    icon: '🐸',
    stages: [
      {
        id: 'egg',
        name: 'Yumurta',
        description: 'Kurbağalar yumurtalarını genellikle suya, kümeler halinde bırakırlar.',
        imageUrl: 'https://picsum.photos/seed/frog-eggs/800/600',
      },
      {
        id: 'tadpole',
        name: 'İribaş (Tetari)',
        description: 'Yumurtadan çıkan larvalar balık gibi kuyrukludur ve solungaçlarıyla nefes alırlar.',
        imageUrl: 'https://picsum.photos/seed/tadpole/800/600',
      },
      {
        id: 'froglet',
        name: 'Genç Kurbağa',
        description: 'Arka ve ön bacaklar oluşmaya başlar, kuyruk kısalır ve akciğerler gelişir.',
        imageUrl: 'https://picsum.photos/seed/small-frog/800/600',
      },
      {
        id: 'adult',
        name: 'Yetişkin Kurbağa',
        description: 'Kuyruk tamamen kaybolur. Kurbağa artık hem karada hem suda yaşayabilir.',
        imageUrl: 'https://picsum.photos/seed/adult-frog/800/600',
      },
    ],
  },
  {
    id: 'bee',
    name: 'Bal Arısı',
    scientificName: 'Apis mellifera',
    icon: '🐝',
    stages: [
      {
        id: 'egg',
        name: 'Yumurta',
        description: 'Kraliçe arı, petek gözlerine her gün binlerce yumurta bırakır.',
        imageUrl: 'https://picsum.photos/seed/bee-egg/800/600',
      },
      {
        id: 'larva',
        name: 'Larva',
        description: 'Yumurtadan çıkan larvalar işçi arılar tarafından arı sütü ve polenle beslenir.',
        imageUrl: 'https://picsum.photos/seed/bee-larva/800/600',
      },
      {
        id: 'pupa',
        name: 'Pupa',
        description: 'Larva ipek bir koza örer ve petek gözü balmumu ile kapatılır. Fiziksel değişim gerçekleşir.',
        imageUrl: 'https://picsum.photos/seed/bee-pupa/800/600',
      },
      {
        id: 'adult',
        name: 'Yetişkin Arı',
        description: 'Gelişimini tamamlayan arı, petek kapağını kemirerek dışarı çıkar ve görevine başlar.',
        imageUrl: 'https://picsum.photos/seed/honey-bee/800/600',
      },
    ],
  },
];
