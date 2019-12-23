import blessed from 'blessed';
import TextEditor from '@/components/TextEditor';

const screen = blessed.screen({
  smartCSR: true,
});

screen.title = 'bce';

const editor = new TextEditor(screen);

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.render();
