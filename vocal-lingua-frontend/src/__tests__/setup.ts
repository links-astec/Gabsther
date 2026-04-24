// Mock browser APIs not available in jsdom

// SpeechSynthesisUtterance — must be a real constructor (not arrow fn)
function MockSpeechSynthesisUtterance(this: any, text: string) {
  this.text = text;
  this.lang = 'fr-FR';
  this.rate = 1;
  this.pitch = 1;
  this.volume = 1;
  this.voice = null;
  this.onstart = null;
  this.onend = null;
  this.onerror = null;
}
(global as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

// SpeechSynthesis — simulates onend firing after speak()
const mockSynthesis = {
  speaking: false,
  pending: false,
  paused: false,
  speak: vi.fn(function (u: any) {
    setTimeout(() => { u.onend?.(); }, 10);
  }),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => [
    { name: 'Google français', lang: 'fr-FR', default: false, localService: false, voiceURI: 'Google français' },
    { name: 'English US', lang: 'en-US', default: true, localService: true, voiceURI: 'English US' },
  ]),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};
Object.defineProperty(window, 'speechSynthesis', { value: mockSynthesis, writable: true });

// AudioContext
(global as any).AudioContext = vi.fn(function (this: any) {
  this.state = 'running';
  this.resume = vi.fn().mockResolvedValue(undefined);
  this.createBuffer = vi.fn(() => ({}));
  this.createBufferSource = vi.fn(() => ({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
  }));
  this.destination = {};
});

// SpeechRecognition
(global as any).webkitSpeechRecognition = vi.fn(function (this: any) {
  this.lang = 'fr-FR';
  this.continuous = false;
  this.interimResults = false;
  this.onresult = null;
  this.onerror = null;
  this.onend = null;
  this.start = vi.fn();
  this.stop = vi.fn();
  this.abort = vi.fn();
});
