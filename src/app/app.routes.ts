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
  {
    path: 'guided',
    loadComponent: () => import('./features/guided/guided').then((m) => m.Guided),
    title: 'Guided round-trip · StegoNinja',
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
    title: 'About · StegoNinja',
  },
  { path: '**', redirectTo: '' },
];
