import { studio } from '../content/studio';
import { contacts, locations } from '../content/contacts';
import { seo, analytics } from '../content/seo';
import { booking } from '../content/booking';
import { portfolio } from '../content/portfolio';
import { diplomas } from '../content/diplomas';
import { reviews } from '../content/reviews';
import { releaseIssues } from './release';

export const publicationIssues = releaseIssues({ studio, contacts, locations, seo, analytics, booking, portfolio, diplomas, reviews });
export const isPublishable = publicationIssues.length === 0;
