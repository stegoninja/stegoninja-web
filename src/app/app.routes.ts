import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'StegoNinja — hide files in images, audio & video',
  },
  {
    path: 'embed',
    loadComponent: () => import('./features/embed/embed-page').then((m) => m.EmbedPage),
    title: 'Embed · StegoNinja',
  },
  // Feature routes (extract, guided, about) are registered as each is built.
  { path: '**', redirectTo: '' },
];
