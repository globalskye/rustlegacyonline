using System;
using System.Linq;
using System.Collections.Generic;
using Newtonsoft.Json;
using Oxide.Core;
using Oxide.Core.Plugins;
using RustExtended;
using UnityEngine;

namespace Oxide.Plugins
{
    [Info("TopSystem", "global01", "3.3.0")]
    [Description("Global statistics system with localization and clan integration")]
    class TopSystem : RustLegacyPlugin
    {
        private Dictionary<ulong, PlayerStats> PlayerData = new Dictionary<ulong, PlayerStats>();
        private string DataFile = "TopSystemData";

        private class SyncConfig
        {
            [JsonProperty("Sync Endpoint URL")]
            public string SyncEndpointUrl { get; set; } = "http://62.122.214.201/api/stats/sync";

            [JsonProperty("Sync Interval (seconds)")]
            public float SyncIntervalSeconds { get; set; } = 120f;

            [JsonProperty("Report Online URL")]
            public string ReportOnlineUrl { get; set; } = "http://62.122.214.201/api/server-status/report";

            [JsonProperty("Server Type (classic or deathmatch)")]
            public string ServerType { get; set; } = "classic";
        }
        private SyncConfig syncConfig;

        
        // Единая цветовая схема: синий/желтый/белый
        private const string COLOR_HEADER = "[COLOR#4169E1]";      // Королевский синий для заголовков
        private const string COLOR_YELLOW = "[COLOR#FFD700]";      // Золотой для важных значений
        private const string COLOR_WHITE = "[COLOR#FFFFFF]";       // Белый для обычного текста
        private const string COLOR_CYAN = "[COLOR#00BFFF]";        // Голубой для подзаголовков
        private const string COLOR_RANK1 = "[COLOR#FFD700]";       // Золото для 1 места
        private const string COLOR_RANK2 = "[COLOR#C0C0C0]";       // Серебро для 2 места
        private const string COLOR_RANK3 = "[COLOR#CD7F32]";       // Бронза для 3 места
        private const string COLOR_NORMAL = "[COLOR#87CEEB]";      // Небесно-голубой для остальных

        #region Data Structure
        private class OnlinePlayer { public string steamId; public string username; }

        public class PlayerStats
        {
            [JsonProperty("RaidObjects")] public int RaidObjects = 0;
            [JsonProperty("TimeMinutes")] public float TimeMinutes = 0;
            [JsonProperty("Wood")] public int Wood = 0;
            [JsonProperty("Metal")] public int Metal = 0;
            [JsonProperty("Sulfur")] public int Sulfur = 0;
            [JsonProperty("Leather")] public int Leather = 0;
            [JsonProperty("Cloth")] public int Cloth = 0;
            [JsonProperty("Fat")] public int Fat = 0;
            [JsonProperty("Suicides")] public int Suicides = 0;
        }
        #endregion

        #region Core Hooks
        void Loaded()
        {
            LoadData();
            LoadSyncConfig();

            foreach (var u in rust.GetAllNetUsers())
                if (!PlayerData.ContainsKey(u.userID))
                    PlayerData[u.userID] = new PlayerStats();

            timer.Every(60f, UpdateOnlineTime);

            if (!string.IsNullOrEmpty(syncConfig?.SyncEndpointUrl))
            {
                float interval = syncConfig.SyncIntervalSeconds > 0 ? syncConfig.SyncIntervalSeconds : 120f;
                timer.Every(interval, SyncDataToServer);
                Puts($"[TopSystem] Sync enabled: {syncConfig.SyncEndpointUrl} every {interval}s");
            }
            Puts($"[TopSystem] Loaded {PlayerData.Count} player records.");
        }

        protected override void LoadDefaultConfig()
        {
            Config.WriteObject(new SyncConfig(), true);
        }

        // Rust Legacy Mono - only HTTP works (no HTTPS/TLS)
        string ToHttpUrl(string u)
        {
            if (string.IsNullOrEmpty(u)) return u;
            u = u.TrimEnd('/');
            if (u.StartsWith("https://", System.StringComparison.OrdinalIgnoreCase))
                u = "http://" + u.Substring(8);
            else if (!u.StartsWith("http://", System.StringComparison.OrdinalIgnoreCase))
                u = "http://" + u;
            return u;
        }

        void LoadSyncConfig()
        {
            try
            {
                syncConfig = Config.ReadObject<SyncConfig>();
                if (syncConfig == null) syncConfig = new SyncConfig();
            }
            catch
            {
                syncConfig = new SyncConfig();
                Config.WriteObject(syncConfig, true);
            }
        }

        void OnServerSave() => SaveData();
        void Unload() => SaveData();

        void UpdateOnlineTime()
        {
            foreach (var u in rust.GetAllNetUsers())
            {
                if (!PlayerData.ContainsKey(u.userID))
                    PlayerData[u.userID] = new PlayerStats();
                PlayerData[u.userID].TimeMinutes += 1f;
            }
        }

        void LoadData()
        {
            try
            {
                PlayerData = Interface.Oxide.DataFileSystem.ReadObject<Dictionary<ulong, PlayerStats>>(DataFile);
            }
            catch
            {
                PlayerData = new Dictionary<ulong, PlayerStats>();
            }
        }

        void SaveData() =>
            Interface.Oxide.DataFileSystem.WriteObject(DataFile, PlayerData, true);

        void SyncDataToServer()
        {
            if (syncConfig == null || string.IsNullOrEmpty(syncConfig.SyncEndpointUrl)) return;

            var onlineIds = new HashSet<ulong>();
            foreach (var u in rust.GetAllNetUsers())
                onlineIds.Add(u.userID);

            var players = new List<object>();
            try
            {
                foreach (var eco in Economy.Database.Values)
                {
                    var pd = PlayerData.ContainsKey(eco.SteamID) ? PlayerData[eco.SteamID] : null;
                    var user = Users.GetBySteamID(eco.SteamID);
                    players.Add(new
                    {
                        steamId = eco.SteamID.ToString(),
                        username = user?.Username ?? "Unknown",
                        killedPlayers = eco.PlayersKilled,
                        killedMutants = eco.MutantsKilled,
                        killedAnimals = eco.AnimalsKilled,
                        deaths = eco.Deaths,
                        balance = eco.Balance,
                        playTime = pd != null ? (int)pd.TimeMinutes : 0,
                        isOnline = onlineIds.Contains(eco.SteamID),
                        clanId = user?.Clan?.ID,
                        stats = pd != null ? new
                        {
                            raidObjects = pd.RaidObjects,
                            timeMinutes = (int)pd.TimeMinutes,
                            wood = pd.Wood,
                            metal = pd.Metal,
                            sulfur = pd.Sulfur,
                            suicides = pd.Suicides
                        } : null
                    });
                }
            }
            catch (Exception ex) { Puts($"[TopSystem] Sync players error: {ex.Message}"); return; }

            var clans = new List<object>();
            try
            {
                int idx = 1;
                foreach (var c in Clans.All)
                {
                    var memberIds = new List<string>();
                    if (c.Members != null)
                        foreach (var m in c.Members)
                            memberIds.Add(m.Key.SteamID.ToString());
                    clans.Add(new
                    {
                        id = idx++,
                        hexId = c.ID.ToString() ?? "",
                        name = c.Name ?? "",
                        abbrev = c.Abbr ?? "",
                        leaderSteamId = c.LeaderID.ToString(),
                        level = c.Level != null ? c.Level.Id : 0,
                        experience = c.Experience,
                        memberCount = c.Members != null ? c.Members.Count : 0,
                        memberIds = memberIds
                    });
                }
            }
            catch (Exception ex) { Puts($"[TopSystem] Sync clans error: {ex.Message}"); return; }

            var payload = new
            {
                timestamp = DateTime.UtcNow.ToString("o"),
                serverStatus = new
                {
                    isOnline = true,
                    currentPlayers = onlineIds.Count,
                    maxPlayers = 100
                },
                players = players,
                clans = clans
            };

            string json = JsonConvert.SerializeObject(payload);
            string url = ToHttpUrl(syncConfig.SyncEndpointUrl);

            var headers = new Dictionary<string, string>();
            headers.Add("Content-Type", "application/json");

            webrequest.EnqueuePost(url, json, (code, response) =>
            {
                if (code == 200)
                    Puts("[TopSystem] Synced " + players.Count + " players, " + clans.Count + " clans to server");
                else
                    Puts("[TopSystem] Sync failed: " + code + " - " + response);
            }, this, headers);

            // Report current online: steamId + nickname (HTTP only, like RaidReport)
            if (!string.IsNullOrEmpty(syncConfig.ReportOnlineUrl))
            {
                string st = (syncConfig.ServerType ?? "classic").ToLower();
                if (st != "classic" && st != "deathmatch") st = "classic";
                var onlineList = new System.Collections.Generic.List<OnlinePlayer>();
                foreach (var u in rust.GetAllNetUsers())
                {
                    if (Users.HasFlag(u.userID, UserFlags.invis)) continue;
                    onlineList.Add(new OnlinePlayer { steamId = u.userID.ToString(), username = u.displayName ?? "Unknown" });
                }
                var reportPayload = new Dictionary<string, object>();
                reportPayload[st] = new { currentPlayers = onlineList.Count, players = onlineList };
                string reportJson = JsonConvert.SerializeObject(reportPayload);
                string reportUrl = ToHttpUrl(syncConfig.ReportOnlineUrl);

                var reportHeaders = new Dictionary<string, string>();
                reportHeaders.Add("Content-Type", "application/json");

                webrequest.EnqueuePost(reportUrl, reportJson, (c, res) =>
                {
                    if (c == 200) Puts("[TopSystem] Reported online: " + onlineList.Count + " players to " + st);
                }, this, reportHeaders);
            }
        }
        #endregion

        #region Event Handlers
        void OnGather(Inventory inv, ResourceTarget obj, ResourceGivePair item, int collected)
        {
            if (inv == null || item == null || collected < 1) return;
            var user = NetUser.Find(inv.networkView.owner);
            if (user == null) return;

            if (!PlayerData.ContainsKey(user.userID))
                PlayerData[user.userID] = new PlayerStats();

            var s = PlayerData[user.userID];
            switch (item.ResourceItemName)
            {
                case "Metal Ore": s.Metal += collected; break;
                case "Sulfur Ore": s.Sulfur += collected; break;
                case "Wood": s.Wood += collected; break;
                case "Leather": s.Leather += collected; break;
                case "Cloth": s.Cloth += collected; break;
                case "Animal Fat": s.Fat += collected; break;
            }
        }

        void OnKilled(TakeDamage damage, DamageEvent evt)
        {
            
            //TODO: remake because player can be offline :DDDD
            
            if (evt.attacker.client == null || evt.victim.client == null) return;
            if (evt.amount < damage.health) return;

            ulong attackerID = 0;
            ulong victimID = evt.victim.client.userID;

            // Определяем атакующего
            if (evt.attacker.client != null)
                attackerID = evt.attacker.client.userID;
            else if (evt.attacker.idMain is DeployableObject)
                attackerID = (evt.attacker.idMain as DeployableObject).ownerID;
            else if (evt.attacker.idMain is StructureComponent)
                attackerID = (evt.attacker.idMain as StructureComponent)._master.ownerID;

            // Проверка на суицид
            if (attackerID == victimID)
            {
                if (!PlayerData.ContainsKey(victimID))
                    PlayerData[victimID] = new PlayerStats();
                PlayerData[victimID].Suicides++;
                SaveData();
                return;
            }

            if (attackerID == 0) return;
            if (!PlayerData.ContainsKey(attackerID))
                PlayerData[attackerID] = new PlayerStats();

            // Подсчет рейдов (разрушенных объектов)
            if (evt.victim.idMain is StructureComponent || evt.victim.idMain is DeployableObject)
            {
                PlayerData[attackerID].RaidObjects++;
                SaveData();
            }
        }
        #endregion

        #region Commands

        [ChatCommand("tops")]
        void cmdTop(NetUser user, string cmd, string[] args)
        {
            
            string lang = GetLanguage(user);
            int num = 10;
            if (args.Length > 1) int.TryParse(args[1], out num);
            if (num > 15) num = 15;
            if (num < 1) num = 10;

            if (args.Length == 0)
            {
                ShowTopHelp(user, lang);
                return;
            }

            string arg = args[0].ToLower();
            switch (arg)
            {
                case "kill": ShowTopKill(user, num, lang); break;
                case "death": ShowTopDeaths(user, num, lang); break;
                case "anim": ShowTopAnimal(user, num, lang); break;
                case "mtnt": ShowTopMutant(user, num, lang); break;
                case "raid": ShowTopRaid(user, num, lang); break;
                case "farm": ShowTopFarm(user, num, lang); break;
                case "time": ShowTopTime(user, num, lang); break;
                case "money": ShowTopMoney(user, num, lang); break;
                case "clan": ShowTopClan(user, num, lang); break;
                case "suicide": ShowTopSuicides(user, num, lang); break;
                case "kd": ShowTopKD(user, num, lang); break;
                default: ShowTopHelp(user, lang); break;
            }
        }

        [ChatCommand("stats")]
        void cmdStat(NetUser user, string cmd, string[] args)
        {
            string lang = GetLanguage(user);
            var eco = Economy.Get(user.userID);
            if (!PlayerData.ContainsKey(user.userID))
                PlayerData[user.userID] = new PlayerStats();
            var s = PlayerData[user.userID];
            var clanData = Users.GetBySteamID(user.userID)?.Clan;

            string clan = clanData != null
                ? $"{clanData.Name} (Lvl {clanData.Level.Id})"
                : GetText(lang, "no_clan");

            var t = TimeSpan.FromMinutes(s.TimeMinutes);
            string timeText = t.TotalDays >= 1 ?
                $"{t.Days}d {t.Hours}h {t.Minutes}m" :
                $"{t.Hours}h {t.Minutes}m";

            // Расчет K/D
            int pvpDeaths = eco.Deaths - s.Suicides;
            if (pvpDeaths < 0) pvpDeaths = 0;
            double kd = pvpDeaths > 0 ? (double)eco.PlayersKilled / pvpDeaths : eco.PlayersKilled;

            // Заголовок
            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "title_stat")}{COLOR_WHITE}{Users.GetUsername(user.userID)}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            
            // PvP статистика
            Broadcast.Message(user, $"{COLOR_CYAN}► {GetText(lang, "pvp_stats")}");
            Broadcast.Message(user, $"  {COLOR_WHITE}{GetText(lang, "kills")} {COLOR_YELLOW}{eco.PlayersKilled}  {COLOR_WHITE}|  {GetText(lang, "deaths_pvp")} {COLOR_YELLOW}{pvpDeaths}  {COLOR_WHITE}|  K/D: {COLOR_YELLOW}{kd:F2}");
            Broadcast.Message(user, $"  {COLOR_WHITE}{GetText(lang, "suicides")} {COLOR_YELLOW}{s.Suicides}  {COLOR_WHITE}|  {GetText(lang, "deaths_total")} {COLOR_YELLOW}{eco.Deaths}");
            
            // PvE статистика
            Broadcast.Message(user, $"{COLOR_CYAN}► {GetText(lang, "pve_stats")}");
            Broadcast.Message(user, $"  {COLOR_WHITE}{GetText(lang, "animals")} {COLOR_YELLOW}{eco.AnimalsKilled}  {COLOR_WHITE}|  {GetText(lang, "mutants")} {COLOR_YELLOW}{eco.MutantsKilled}");
            
            // Рейды
            Broadcast.Message(user, $"{COLOR_CYAN}► {GetText(lang, "raid_stats")}");
            Broadcast.Message(user, $"  {COLOR_WHITE}{GetText(lang, "raidobj")} {COLOR_YELLOW}{s.RaidObjects}");
            
            // Фарм
            Broadcast.Message(user, $"{COLOR_CYAN}► {GetText(lang, "farm_stats")}");
            Broadcast.Message(user, $"  {COLOR_WHITE}Sulfur: {COLOR_YELLOW}{s.Sulfur}  {COLOR_WHITE}|  Metal: {COLOR_YELLOW}{s.Metal}  {COLOR_WHITE}|  Wood: {COLOR_YELLOW}{s.Wood}");
            Broadcast.Message(user, $"  {COLOR_WHITE}Leather: {COLOR_YELLOW}{s.Leather}  {COLOR_WHITE}|  Cloth: {COLOR_YELLOW}{s.Cloth}  {COLOR_WHITE}|  Fat: {COLOR_YELLOW}{s.Fat}");
            
            // Общее
            Broadcast.Message(user, $"{COLOR_CYAN}► {GetText(lang, "general_stats")}");
            Broadcast.Message(user, $"  {COLOR_WHITE}{GetText(lang, "balance")} {COLOR_YELLOW}{eco.Balance:N0}");
            Broadcast.Message(user, $"  {COLOR_WHITE}{GetText(lang, "time_played")} {COLOR_YELLOW}{timeText}");
            Broadcast.Message(user, $"  {COLOR_WHITE}{GetText(lang, "clan")} {COLOR_YELLOW}{clan}");
        }

        void ShowTopHelp(NetUser user, string lang)
        {
            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║        {GetText(lang, "available_tops")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            Broadcast.Message(user, $"{COLOR_CYAN}► {COLOR_WHITE}/top kill [1-15] {COLOR_CYAN}- {GetText(lang, "desc_kill")}");
            Broadcast.Message(user, $"{COLOR_CYAN}► {COLOR_WHITE}/top death [1-15] {COLOR_CYAN}- {GetText(lang, "desc_death")}");
            Broadcast.Message(user, $"{COLOR_CYAN}► {COLOR_WHITE}/top suicide [1-15] {COLOR_CYAN}- {GetText(lang, "desc_suicide")}");
            Broadcast.Message(user, $"{COLOR_CYAN}► {COLOR_WHITE}/top kd [1-15] {COLOR_CYAN}- {GetText(lang, "desc_kd")}");
            Broadcast.Message(user, $"{COLOR_CYAN}► {COLOR_WHITE}/top anim [1-15] {COLOR_CYAN}- {GetText(lang, "desc_anim")}");
            Broadcast.Message(user, $"{COLOR_CYAN}► {COLOR_WHITE}/top mtnt [1-15] {COLOR_CYAN}- {GetText(lang, "desc_mtnt")}");
            Broadcast.Message(user, $"{COLOR_CYAN}► {COLOR_WHITE}/top raid [1-15] {COLOR_CYAN}- {GetText(lang, "desc_raid")}");
            Broadcast.Message(user, $"{COLOR_CYAN}► {COLOR_WHITE}/top farm [1-15] {COLOR_CYAN}- {GetText(lang, "desc_farm")}");
            Broadcast.Message(user, $"{COLOR_CYAN}► {COLOR_WHITE}/top money [1-15] {COLOR_CYAN}- {GetText(lang, "desc_money")}");
            Broadcast.Message(user, $"{COLOR_CYAN}► {COLOR_WHITE}/top time [1-15] {COLOR_CYAN}- {GetText(lang, "desc_time")}");
            Broadcast.Message(user, $"{COLOR_CYAN}► {COLOR_WHITE}/top clan [1-15] {COLOR_CYAN}- {GetText(lang, "desc_clan")}");
            Broadcast.Message(user, $"{COLOR_HEADER}═══════════════════════════════════════");
        }
        #endregion

        #region Tops
        void ShowTopKill(NetUser user, int num, string lang)
        {
            var list = Economy.Database.Values.OrderByDescending(e => e.PlayersKilled).Take(num).ToList();
            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "top_kill")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            for (int i = 0; i < list.Count; i++)
            {
                string color = GetRankColor(i);
                string name = Users.GetBySteamID(list[i].SteamID)?.Username ?? "Unknown";
                Broadcast.Message(user, $"{color}{i + 1}. {COLOR_WHITE}{name} {COLOR_CYAN}- {COLOR_YELLOW}{list[i].PlayersKilled} {GetText(lang, "kills_count")}");
            }
        }

        void ShowTopDeaths(NetUser user, int num, string lang)
        {
            var combinedList = Economy.Database.Values.Select(e =>
            {
                int suicides = PlayerData.ContainsKey(e.SteamID) ? PlayerData[e.SteamID].Suicides : 0;
                int pvpDeaths = e.Deaths - suicides;
                if (pvpDeaths < 0) pvpDeaths = 0;
                return new { Economy = e, PvPDeaths = pvpDeaths };
            }).OrderByDescending(x => x.PvPDeaths).Take(num).ToList();

            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "top_deaths")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            for (int i = 0; i < combinedList.Count; i++)
            {
                string color = GetRankColor(i);
                string name = Users.GetBySteamID(combinedList[i].Economy.SteamID)?.Username ?? "Unknown";
                Broadcast.Message(user, $"{color}{i + 1}. {COLOR_WHITE}{name} {COLOR_CYAN}- {COLOR_YELLOW}{combinedList[i].PvPDeaths} {GetText(lang, "deaths_count")}");
            }
        }

        void ShowTopSuicides(NetUser user, int num, string lang)
        {
            var list = PlayerData.OrderByDescending(p => p.Value.Suicides).Take(num).ToList();
            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "top_suicide")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            for (int i = 0; i < list.Count; i++)
            {
                string color = GetRankColor(i);
                string name = Users.GetUsername(list[i].Key) ?? list[i].Key.ToString();
                Broadcast.Message(user, $"{color}{i + 1}. {COLOR_WHITE}{name} {COLOR_CYAN}- {COLOR_YELLOW}{list[i].Value.Suicides} {GetText(lang, "suicides_count")}");
            }
        }

        void ShowTopKD(NetUser user, int num, string lang)
        {
            var kdList = Economy.Database.Values.Select(e =>
            {
                int suicides = PlayerData.ContainsKey(e.SteamID) ? PlayerData[e.SteamID].Suicides : 0;
                int pvpDeaths = e.Deaths - suicides;
                if (pvpDeaths < 0) pvpDeaths = 0;
                double kd = pvpDeaths > 0 ? (double)e.PlayersKilled / pvpDeaths : e.PlayersKilled;
                return new { Economy = e, KD = kd, Kills = e.PlayersKilled, Deaths = pvpDeaths };
            })
            .Where(x => x.Kills >= 10) // Минимум 10 киллов для попадания в топ
            .OrderByDescending(x => x.KD)
            .Take(num)
            .ToList();

            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "top_kd")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            for (int i = 0; i < kdList.Count; i++)
            {
                string color = GetRankColor(i);
                string name = Users.GetBySteamID(kdList[i].Economy.SteamID)?.Username ?? "Unknown";
                Broadcast.Message(user, $"{color}{i + 1}. {COLOR_WHITE}{name} {COLOR_CYAN}- K/D: {COLOR_YELLOW}{kdList[i].KD:F2} {COLOR_WHITE}({kdList[i].Kills}/{kdList[i].Deaths})");
            }
        }

        void ShowTopAnimal(NetUser user, int num, string lang)
        {
            var list = Economy.Database.Values.OrderByDescending(e => e.AnimalsKilled).Take(num).ToList();
            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "top_anim")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            for (int i = 0; i < list.Count; i++)
            {
                string color = GetRankColor(i);
                string name = Users.GetBySteamID(list[i].SteamID)?.Username ?? "Unknown";
                Broadcast.Message(user, $"{color}{i + 1}. {COLOR_WHITE}{name} {COLOR_CYAN}- {COLOR_YELLOW}{list[i].AnimalsKilled} {GetText(lang, "animals_count")}");
            }
        }

        void ShowTopMutant(NetUser user, int num, string lang)
        {
            var list = Economy.Database.Values.OrderByDescending(e => e.MutantsKilled).Take(num).ToList();
            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "top_mtnt")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            for (int i = 0; i < list.Count; i++)
            {
                string color = GetRankColor(i);
                string name = Users.GetBySteamID(list[i].SteamID)?.Username ?? "Unknown";
                Broadcast.Message(user, $"{color}{i + 1}. {COLOR_WHITE}{name} {COLOR_CYAN}- {COLOR_YELLOW}{list[i].MutantsKilled} {GetText(lang, "mutants_count")}");
            }
        }

        void ShowTopMoney(NetUser user, int num, string lang)
        {
            var list = Economy.Database.Values.OrderByDescending(e => e.Balance).Take(num).ToList();
            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "top_money")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            for (int i = 0; i < list.Count; i++)
            {
                string color = GetRankColor(i);
                string name = Users.GetBySteamID(list[i].SteamID)?.Username ?? "Unknown";
                Broadcast.Message(user, $"{color}{i + 1}. {COLOR_WHITE}{name} {COLOR_CYAN}- {COLOR_YELLOW}{list[i].Balance:N0}$");
            }
        }

        void ShowTopClan(NetUser user, int num, string lang)
        {
            var list = Clans.All.OrderByDescending(c => c.Level.Id).ThenByDescending(c => c.Experience).Take(num).ToList();
            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "top_clan")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            for (int i = 0; i < list.Count; i++)
            {
                string color = GetRankColor(i);
                string leader = Users.GetBySteamID(list[i].LeaderID)?.Username ?? "Unknown";
                Broadcast.Message(user, $"{color}{i + 1}. {COLOR_WHITE}[{list[i].Name}] {COLOR_CYAN}Lvl {COLOR_YELLOW}{list[i].Level.Id} {COLOR_WHITE}| XP: {COLOR_YELLOW}{list[i].Experience} {COLOR_WHITE}| {GetText(lang, "leader")} {leader}");
            }
        }

        void ShowTopRaid(NetUser user, int num, string lang)
        {
            var list = PlayerData.OrderByDescending(p => p.Value.RaidObjects).Take(num).ToList();
            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "top_raid")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            for (int i = 0; i < list.Count; i++)
            {
                string color = GetRankColor(i);
                string name = Users.GetUsername(list[i].Key) ?? list[i].Key.ToString();
                Broadcast.Message(user, $"{color}{i + 1}. {COLOR_WHITE}{name} {COLOR_CYAN}- {COLOR_YELLOW}{list[i].Value.RaidObjects} {GetText(lang, "objects_destroyed")}");
            }
        }

        void ShowTopFarm(NetUser user, int num, string lang)
        {
            var list = PlayerData.OrderByDescending(p => p.Value.Sulfur + p.Value.Metal + p.Value.Wood).Take(num).ToList();
            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "top_farm")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            for (int i = 0; i < list.Count; i++)
            {
                string color = GetRankColor(i);
                var s = list[i].Value;
                string name = Users.GetUsername(list[i].Key) ?? list[i].Key.ToString();
                int total = s.Sulfur + s.Metal + s.Wood;
                Broadcast.Message(user, $"{color}{i + 1}. {COLOR_WHITE}{name} {COLOR_CYAN}- {GetText(lang, "total")} {COLOR_YELLOW}{total}");
                Broadcast.Message(user, $"    {COLOR_WHITE}Sulfur: {COLOR_YELLOW}{s.Sulfur} {COLOR_WHITE}| Metal: {COLOR_YELLOW}{s.Metal} {COLOR_WHITE}| Wood: {COLOR_YELLOW}{s.Wood}");
            }
        }

        void ShowTopTime(NetUser user, int num, string lang)
        {
            var list = PlayerData.OrderByDescending(p => p.Value.TimeMinutes).Take(num).ToList();
            Broadcast.Message(user, $"{COLOR_HEADER}╔═══════════════════════════════════════╗");
            Broadcast.Message(user, $"{COLOR_HEADER}║  {GetText(lang, "top_time")}");
            Broadcast.Message(user, $"{COLOR_HEADER}╚═══════════════════════════════════════╝");
            for (int i = 0; i < list.Count; i++)
            {
                string color = GetRankColor(i);
                string name = Users.GetUsername(list[i].Key) ?? list[i].Key.ToString();
                var time = TimeSpan.FromMinutes(list[i].Value.TimeMinutes);
                string timeText = time.TotalDays >= 1 ?
                    $"{time.Days}d {time.Hours}h {time.Minutes}m" :
                    $"{time.Hours}h {time.Minutes}m";
                Broadcast.Message(user, $"{color}{i + 1}. {COLOR_WHITE}{name} {COLOR_CYAN}- {COLOR_YELLOW}{timeText}");
            }
        }

        string GetRankColor(int index)
        {
            switch (index)
            {
                case 0: return COLOR_RANK1;  // Золото
                case 1: return COLOR_RANK2;  // Серебро
                case 2: return COLOR_RANK3;  // Бронза
                default: return COLOR_NORMAL; // Обычный
            }
        }
        #endregion

        #region Localization
            string GetLanguage(NetUser user)
            {
                try
                {
                    var lang = Users.GetBySteamID(user.userID)?.Language ?? "RUS";
                    lang = lang.ToUpper();
                    if (lang != "RUS" && lang != "ENG" && lang != "ESP") lang = "RUS";
                    return lang;
                }
                catch { return "RUS"; }
            }

        string GetText(string lang, string key)
        {
            var L = new Dictionary<string, Dictionary<string, string>>
            {
                ["RUS"] = new Dictionary<string, string>
                {
                    // Заголовки и справка
                    ["available_tops"] = "Доступные топы",
                    ["title_stat"] = "Статистика игрока: ",
                    
                    // Описания топов
                    ["desc_kill"] = "Топ убийц игроков",
                    ["desc_death"] = "Топ смертей от игроков",
                    ["desc_suicide"] = "Топ самоубийц",
                    ["desc_kd"] = "Топ по соотношению K/D",
                    ["desc_anim"] = "Топ охотников на животных",
                    ["desc_mtnt"] = "Топ убийц мутантов",
                    ["desc_raid"] = "Топ рейдеров (разрушено объектов)",
                    ["desc_farm"] = "Топ фармеров ресурсов",
                    ["desc_money"] = "Топ богачей сервера",
                    ["desc_time"] = "Топ по времени на сервере",
                    ["desc_clan"] = "Топ кланов по уровню",
                    
                    // Категории статистики
                    ["pvp_stats"] = "PvP Статистика",
                    ["pve_stats"] = "PvE Статистика",
                    ["raid_stats"] = "Рейды",
                    ["farm_stats"] = "Фарм Ресурсов",
                    ["general_stats"] = "Общая Информация",
                    
                    // Статы
                    ["kills"] = "Убийств игроков:",
                    ["deaths_pvp"] = "Смертей от игроков:",
                    ["deaths_total"] = "Всего смертей:",
                    ["suicides"] = "Самоубийств:",
                    ["animals"] = "Убито животных:",
                    ["mutants"] = "Убито мутантов:",
                    ["raidobj"] = "Разрушено объектов:",
                    ["balance"] = "Баланс:",
                    ["time_played"] = "Время в игре:",
                    ["clan"] = "Клан:",
                    ["no_clan"] = "Нет клана",
                    
                    // Топы
                    ["top_kill"] = "ТОП УБИЙЦ ИГРОКОВ",
                    ["top_deaths"] = "ТОП СМЕРТЕЙ ОТ ИГРОКОВ",
                    ["top_suicide"] = "ТОП САМОУБИЙЦ",
                    ["top_kd"] = "ТОП K/D СООТНОШЕНИЕ",
                    ["top_anim"] = "ТОП ОХОТНИКОВ",
                    ["top_mtnt"] = "ТОП УБИЙЦ МУТАНТОВ",
                    ["top_raid"] = "ТОП РЕЙДЕРОВ",
                    ["top_farm"] = "ТОП ФАРМЕРОВ",
                    ["top_time"] = "ТОП ПОСТОЯЛЬЦЕВ",
                    ["top_money"] = "ТОП БОГАЧЕЙ",
                    ["top_clan"] = "ТОП КЛАНОВ",
                    
                    // Счетчики
                    ["kills_count"] = "убийств",
                    ["deaths_count"] = "смертей",
                    ["suicides_count"] = "суицидов",
                    ["animals_count"] = "животных",
                    ["mutants_count"] = "мутантов",
                    ["objects_destroyed"] = "объектов",
                    ["total"] = "Всего:",
                    ["leader"] = "Лидер:"
                },
                ["ENG"] = new Dictionary<string, string>
                {
                    ["available_tops"] = "Available Tops",
                    ["title_stat"] = "Player Stats: ",
                    
                    ["desc_kill"] = "Top player killers",
                    ["desc_death"] = "Top deaths from players",
                    ["desc_suicide"] = "Top suicides",
                    ["desc_kd"] = "Top K/D ratio",
                    ["desc_anim"] = "Top animal hunters",
                    ["desc_mtnt"] = "Top mutant killers",
                    ["desc_raid"] = "Top raiders (destroyed objects)",
                    ["desc_farm"] = "Top resource farmers",
                    ["desc_money"] = "Top richest players",
                    ["desc_time"] = "Top playtime",
                    ["desc_clan"] = "Top clans by level",
                    
                    ["pvp_stats"] = "PvP Statistics",
                    ["pve_stats"] = "PvE Statistics",
                    ["raid_stats"] = "Raiding",
                    ["farm_stats"] = "Resource Farming",
                    ["general_stats"] = "General Information",
                    
                    ["kills"] = "Player Kills:",
                    ["deaths_pvp"] = "Deaths from Players:",
                    ["deaths_total"] = "Total Deaths:",
                    ["suicides"] = "Suicides:",
                    ["animals"] = "Animals Killed:",
                    ["mutants"] = "Mutants Killed:",
                    ["raidobj"] = "Objects Destroyed:",
                    ["balance"] = "Balance:",
                    ["time_played"] = "Playtime:",
                    ["clan"] = "Clan:",
                    ["no_clan"] = "No clan",
                    
                    ["top_kill"] = "TOP PLAYER KILLERS",
                    ["top_deaths"] = "TOP DEATHS FROM PLAYERS",
                    ["top_suicide"] = "TOP SUICIDES",
                    ["top_kd"] = "TOP K/D RATIO",
                    ["top_anim"] = "TOP HUNTERS",
                    ["top_mtnt"] = "TOP MUTANT KILLERS",
                    ["top_raid"] = "TOP RAIDERS",
                    ["top_farm"] = "TOP FARMERS",
                    ["top_time"] = "TOP PLAYTIME",
                    ["top_money"] = "TOP RICHEST",
                    ["top_clan"] = "TOP CLANS",
                    
                    ["kills_count"] = "kills",
                    ["deaths_count"] = "deaths",
                    ["suicides_count"] = "suicides",
                    ["animals_count"] = "animals",
                    ["mutants_count"] = "mutants",
                    ["objects_destroyed"] = "objects",
                    ["total"] = "Total:",
                    ["leader"] = "Leader:"
                },
                ["ESP"] = new Dictionary<string, string>
                {
                    ["available_tops"] = "Tops Disponibles",
                    ["title_stat"] = "Estadísticas del Jugador: ",
                    
                    ["desc_kill"] = "Top asesinos de jugadores",
                    ["desc_death"] = "Top muertes por jugadores",
                    ["desc_suicide"] = "Top suicidios",
                    ["desc_kd"] = "Top relación K/D",
                    ["desc_anim"] = "Top cazadores de animales",
                    ["desc_mtnt"] = "Top asesinos de mutantes",
                    ["desc_raid"] = "Top asaltantes (objetos destruidos)",
                    ["desc_farm"] = "Top recolectores de recursos",
                    ["desc_money"] = "Top más ricos",
                    ["desc_time"] = "Top tiempo de juego",
                    ["desc_clan"] = "Top clanes por nivel",
                    
                    ["pvp_stats"] = "Estadísticas PvP",
                    ["pve_stats"] = "Estadísticas PvE",
                    ["raid_stats"] = "Asaltos",
                    ["farm_stats"] = "Recolección de Recursos",
                    ["general_stats"] = "Información General",
                    
                    ["kills"] = "Asesinatos:",
                    ["deaths_pvp"] = "Muertes por jugadores:",
                    ["deaths_total"] = "Muertes totales:",
                    ["suicides"] = "Suicidios:",
                    ["animals"] = "Animales eliminados:",
                    ["mutants"] = "Mutantes eliminados:",
                    ["raidobj"] = "Objetos destruidos:",
                    ["balance"] = "Balance:",
                    ["time_played"] = "Tiempo jugado:",
                    ["clan"] = "Clan:",
                    ["no_clan"] = "Sin clan",
                    
                    ["top_kill"] = "TOP ASESINOS",
                    ["top_deaths"] = "TOP MUERTES POR JUGADORES",
                    ["top_suicide"] = "TOP SUICIDIOS",
                    ["top_kd"] = "TOP RELACIÓN K/D",
                    ["top_anim"] = "TOP CAZADORES",
                    ["top_mtnt"] = "TOP ASESINOS DE MUTANTES",
                    ["top_raid"] = "TOP ASALTANTES",
                    ["top_farm"] = "TOP RECOLECTORES",
                    ["top_time"] = "TOP TIEMPO DE JUEGO",
                    ["top_money"] = "TOP RICOS",
                    ["top_clan"] = "TOP CLANES",
                    
                    ["kills_count"] = "asesinatos",
                    ["deaths_count"] = "muertes",
                    ["suicides_count"] = "suicidios",
                    ["animals_count"] = "animales",
                    ["mutants_count"] = "mutantes",
                    ["objects_destroyed"] = "objetos",
                    ["total"] = "Total:",
                    ["leader"] = "Líder:"
                }
            };
            return L.ContainsKey(lang) && L[lang].ContainsKey(key) ? L[lang][key] : key;
        }
        #endregion
    }
}