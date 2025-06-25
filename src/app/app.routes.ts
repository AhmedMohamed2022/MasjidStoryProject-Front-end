import { Routes } from '@angular/router';
import { authGuard } from './Core/Services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./Features/Home/Home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./Features/Auth/Login/Login.component').then(
        (c) => c.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./Features/Auth/Register/Register.component').then(
        (c) => c.RegisterComponent
      ),
  },
  {
    path: 'masjid/:id',
    loadComponent: () =>
      import('./Features/Masjid-Details/Masjid-Details.component').then(
        (m) => m.MasjidDetailComponent
      ),
  },
  {
    path: 'story-details/:id',
    loadComponent: () =>
      import('./Features/Story-Details/Story-Details.component').then(
        (m) => m.StoryDetailComponent
      ),
  },
  {
    path: 'stories',
    loadComponent: () =>
      import('./Features/stories-list/stories-list.component').then(
        (m) => m.StoriesListComponent
      ),
  },
  {
    path: 'search-masjid',
    loadComponent: () =>
      import('./Features/Search-Masjid/Search-Masjid.component').then(
        (m) => m.SearchMasjidComponent
      ),
  },
  {
    path: 'event-details/:id',
    loadComponent: () =>
      import('./Features/event-details/event-details.component').then(
        (m) => m.EventDetailsComponent
      ),
  },
  {
    path: 'create-event',
    loadComponent: () =>
      import('./Features/create-event/create-event.component').then(
        (m) => m.CreateEventComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'edit-event/:id',
    loadComponent: () =>
      import('./Features/edit-event/edit-event.component').then(
        (m) => m.EditEventComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'my-events',
    loadComponent: () =>
      import('./Features/my-events/my-events.component').then(
        (m) => m.MyEventsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'upcoming-events',
    loadComponent: () =>
      import('./Features/upcoming-events/upcoming-events.component').then(
        (m) => m.UpcomingEventsComponent
      ),
  },
  {
    path: 'masjid-events/:id',
    loadComponent: () =>
      import('./Features/masjid-events/masjid-events.component').then(
        (m) => m.MasjidEventsComponent
      ),
  },
  {
    path: 'communities/:masjidId',
    loadComponent: () =>
      import('./Features/community-list/community-list.component').then(
        (m) => m.CommunityListComponent
      ),
  },
  {
    path: 'community-details/:id',
    loadComponent: () =>
      import('./Features/community-details/community-details.component').then(
        (m) => m.CommunityDetailsComponent
      ),
  },
  {
    path: 'community/create',
    loadComponent: () =>
      import('./Features/community-create/community-create.component').then(
        (m) => m.CreateCommunityComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./Features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
