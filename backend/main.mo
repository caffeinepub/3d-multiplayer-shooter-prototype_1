import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  type Position = {
    x : Float;
    y : Float;
    z : Float;
  };

  type PlayerState = {
    position : Position;
    health : Nat;
    isAlive : Bool;
    ammo : Nat;
    currentWeapon : Text;
  };

  type SessionData = {
    players : Map.Map<Principal, PlayerState>;
    weaponSpawns : [Position];
    sessionActive : Bool;
  };

  let sessions = Map.empty<Text, SessionData>();
  let availableWeapons = List.fromArray(["Pistol", "Rifle", "Shotgun", "SMG"]);

  func createInitialPlayerState() : PlayerState {
    {
      position = { x = 0.0; y = 0.0; z = 0.0 };
      health = 100;
      isAlive = true;
      ammo = 30;
      currentWeapon = "Pistol";
    };
  };

  public shared ({ caller }) func createSession(sessionId : Text) : async () {
    if (sessions.containsKey(sessionId)) {
      Runtime.trap("Session already exists");
    };

    let weaponSpawns = [
      { x = 10.0; y = 0.0; z = 5.0 },
      { x = -15.0; y = 0.0; z = -10.0 },
      { x = 20.0; y = 0.0; z = 15.0 },
    ];

    let initialPlayers = Map.empty<Principal, PlayerState>();

    let newSession : SessionData = {
      players = initialPlayers;
      weaponSpawns;
      sessionActive = true;
    };

    sessions.add(sessionId, newSession);
  };

  public shared ({ caller }) func joinSession(sessionId : Text) : async () {
    let session = switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?s) { s };
    };

    if (session.players.containsKey(caller)) {
      Runtime.trap("Player already joined the session");
    };

    session.players.add(caller, createInitialPlayerState());
  };

  public shared ({ caller }) func updatePlayerPosition(sessionId : Text, pos : Position) : async () {
    let session = switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?s) { s };
    };

    let player = switch (session.players.get(caller)) {
      case (null) { Runtime.trap("Player not found in session") };
      case (?p) { p };
    };

    let updatedPlayer = { player with position = pos };
    session.players.add(caller, updatedPlayer);
  };

  public shared ({ caller }) func shootPlayer(sessionId : Text, target : Principal) : async Bool {
    let session = switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?s) { s };
    };

    let shooter = switch (session.players.get(caller)) {
      case (null) { Runtime.trap("Shooter not found in session") };
      case (?p) { p };
    };

    if (shooter.ammo == 0) { return false };

    let targetPlayer = switch (session.players.get(target)) {
      case (null) { Runtime.trap("Target player not found in session") };
      case (?p) { p };
    };

    let newHealth = if (targetPlayer.health > 10) {
      targetPlayer.health - 10;
    } else {
      0;
    };

    let updatedTarget = {
      targetPlayer with
      health = newHealth;
      isAlive = newHealth > 0;
    };

    let updatedShooter = {
      shooter with
      ammo = if (shooter.ammo > 0) { shooter.ammo - 1 } else { 0 };
    };

    session.players.add(target, updatedTarget);
    session.players.add(caller, updatedShooter);

    true;
  };

  public shared ({ caller }) func pickUpWeapon(sessionId : Text, weapon : Text, position : Position) : async () {
    if (not availableWeapons.contains(weapon)) {
      Runtime.trap("Invalid weapon");
    };

    let session = switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?s) { s };
    };

    let player = switch (session.players.get(caller)) {
      case (null) { Runtime.trap("Player not found in session") };
      case (?p) { p };
    };

    let updatedPlayer = {
      player with
      currentWeapon = weapon;
      ammo = 30;
      position;
    };

    session.players.add(caller, updatedPlayer);
  };

  public shared ({ caller }) func respawnPlayer(sessionId : Text) : async () {
    let session = switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?s) { s };
    };

    if (not session.players.containsKey(caller)) {
      Runtime.trap("Player not found in session");
    };

    session.players.add(caller, createInitialPlayerState());
  };

  public query ({ caller }) func getPlayerState(sessionId : Text, player : Principal) : async PlayerState {
    let session = switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?s) { s };
    };

    switch (session.players.get(player)) {
      case (null) { Runtime.trap("Player not found in session") };
      case (?p) { p };
    };
  };

  public query ({ caller }) func getSessionStatus(sessionId : Text) : async Bool {
    let session = switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?s) { s };
    };
    session.sessionActive;
  };

  public shared ({ caller }) func endSession(sessionId : Text) : async () {
    let session = switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?s) { s };
    };

    let updatedSession = { session with sessionActive = false };
    sessions.add(sessionId, updatedSession);
  };
};
