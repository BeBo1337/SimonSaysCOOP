// What the client sends, Server Receives
enum EventsSocketReceives {
  PING = "ping",
  CREATE_ROOM = "create_room",
  JOIN_ROOM = "join_room",
  START_GAME = "start_game",
  ON_DISCONNECT = "disconnect_game",
  CLICK_BUTTON = "click_button",
  GENERATE_SEQUENCE = "generate_sequence",
  ON_GAME_LEAVE = "on_game_leave",
  LEAVE_ROOM = "on_room_leave",
  RESTART_GAME = "restart_game",
  GAMEOVER = "gameover",
}

// What the server sends, Client receives
enum EventsSocketEmits {
  PONG = "pong",
  ERROR = "error",
  CONNECTED = "connected",
  ROOM_CREATED = "room_created",
  ROOM_JOINED = "room_joined",
  GAME_STARTED = "game_started",
  BUTTON_CLICKED = "button_clicked",
  SEQUENCE_GENERATED = "sequence_generated",
  DISBAND_GAME = "disband_game",
  PLAYER_LEFT_LOBBY = "player_left_lobby",
  GAME_RESTARTED = "game_restarted",
  GAMEOVER_RET = "gameover_ret",
}

// All of them
export const SocketEvents = { ...EventsSocketReceives, ...EventsSocketEmits };
