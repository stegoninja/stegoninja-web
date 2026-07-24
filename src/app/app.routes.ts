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
  {
    path: 'extract',
    loadComponent: () => import('./features/extract/extract-page').then((m) => m.ExtractPage),
    title: 'Extract · StegoNinja',
  },
  // Feature routes (guided, about) are registered as each is built.
  { path: '**', redirectTo: '' },
];
