import { parseYouTubeId } from './youtube.js';

describe('parseYouTubeId', () => {
  it.each([
    ['l4JQdV3nbRU', 'l4JQdV3nbRU'],
    ['https://www.youtube.com/watch?v=l4JQdV3nbRU&t=10s', 'l4JQdV3nbRU'],
    ['https://youtu.be/l4JQdV3nbRU?si=x', 'l4JQdV3nbRU'],
    ['https://youtube.com/shorts/AHHp_ce8G_s', 'AHHp_ce8G_s'],
    ['youtube.com/embed/AHHp_ce8G_s', 'AHHp_ce8G_s'],
  ])('reads %s', (input, id) => expect(parseYouTubeId(input)).toBe(id));

  it.each(['', 'not a link', 'https://vimeo.com/123', 'https://youtube.com/watch?v=short'])('rejects %s', (input) =>
    expect(parseYouTubeId(input)).toBeNull(),
  );
});
