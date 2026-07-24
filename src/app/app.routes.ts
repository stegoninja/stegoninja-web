import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'StegoNinja — hide files in images, audio & video',
  },
  // Feature routes (embed, extract, guided, about) are registered as each is built.
  { path: '**', redirectTo: '' },
];
