using Oxide.Core;
using Oxide.Core.Plugins;
using RustExtended;
using Newtonsoft.Json;
using UnityEngine;
using System.Collections.Generic;
using System.Linq;
using System;

namespace Oxide.Plugins
{

    [Info("RaidReport", "global01", "4.0.0")]
    [Description("Production-ready raid notification system with per-service verification")]
    public class RaidReport : RustLegacyPlugin
    {
        [PluginReference] Plugin Location;

        private const string ChatName = "RaidAlert";
        private Configuration config;
        private Dictionary<string, RaidIDs> RaidData;
        private Dictionary<ulong, float> lastNotificationTime = new Dictionary<ulong, float>();

        #region Configuration

        private class Configuration
        {
            [JsonProperty("Notification Service URL")]
            public string NotificationServiceURL { get; set; }

            [JsonProperty("Server Identifier")]
            public string ServerIdentifier { get; set; }

            [JsonProperty("Print Location")]
            public bool PrintLocation { get; set; }

            [JsonProperty("Test Mode (allow weapon damage)")]
            public bool TestMode { get; set; }

            [JsonProperty("Notification Cooldown (seconds)")]
            public float NotificationCooldown { get; set; }

            [JsonProperty("Retry Failed Requests")]
            public bool RetryFailedRequests { get; set; }

            [JsonProperty("Max Retry Attempts")]
            public int MaxRetryAttempts { get; set; }

            [JsonProperty("Web Request Timeout (seconds)")]
            public float WebRequestTimeout { get; set; }

            [JsonProperty("Debug Mode")]
            public bool DebugMode { get; set; }

            [JsonProperty("Notify Only On Destruction")]
            public bool NotifyOnlyOnDestruction { get; set; }

            public Configuration()
            {
                NotificationServiceURL = "http://62.122.214.201:8000";
                ServerIdentifier = "DarkRust";
                PrintLocation = true;
                TestMode = false;
                NotificationCooldown = 0f;
                RetryFailedRequests = true;
                MaxRetryAttempts = 3;
                WebRequestTimeout = 10f;
                DebugMode = false;
                NotifyOnlyOnDestruction = true;
            }
        }

        protected override void LoadDefaultConfig()
        {
            Config.WriteObject(GetDefaultConfig(), true);
            Puts("Default configuration created");
        }

        private Configuration GetDefaultConfig()
        {
            return new Configuration();
        }

        #endregion

        #region Data Management

        public class RaidIDs
        {
            public string vk = "";
            public string telegram = "";
            public string discord = "";
            public bool clan = false;
            public bool vkVerified = false;
            public bool telegramVerified = false;
            public bool discordVerified = false;
            public string preferredService = ""; // "telegram", "discord", или "vk"
            public string lang = "en";

            public bool HasAnyService()
            {
                return !string.IsNullOrEmpty(vk) || 
                       !string.IsNullOrEmpty(telegram) || 
                       !string.IsNullOrEmpty(discord);
            }

            public bool IsServiceVerified(string service)
            {
                switch (service.ToLower())
                {
                    case "telegram":
                        return telegramVerified;
                    case "discord":
                        return discordVerified;
                    case "vk":
                        return vkVerified;
                    default:
                        return false;
                }
            }

            public bool HasVerifiedService()
            {
                return telegramVerified || discordVerified || vkVerified;
            }

            public string GetServiceId(string service)
            {
                switch (service.ToLower())
                {
                    case "telegram":
                        return telegram;
                    case "discord":
                        return discord;
                    case "vk":
                        return vk;
                    default:
                        return "";
                }
            }
        }

        private class Messages
        {
            public static Dictionary<string, Dictionary<string, string>> Texts = new Dictionary<string, Dictionary<string, string>>
            {
                ["en"] = new Dictionary<string, string>
                {
                    ["help_header"] = "[color #00FF00]═══ RaidAlert Commands ═══[/color]",
                    ["help_telegram"] = "[color #FFFF00]/raidalert telegram <id>[/color] - Connect Telegram",
                    ["help_discord"] = "[color #FFFF00]/raidalert discord <id>[/color] - Connect Discord",
                    ["help_vk"] = "[color #FFFF00]/raidalert vk <id>[/color] - Connect VK",
                    ["help_verify"] = "[color #FFD700]/raidalert <service> verify <code>[/color] - Verify service",
                    ["help_preferred"] = "[color #FFD700]/raidalert preferred <service>[/color] - Set preferred notification service",
                    ["help_clan"] = "[color #FFFF00]/raidalert clan[/color] - Toggle clan notifications",
                    ["help_status"] = "[color #FFFF00]/raidalert status[/color] - Show your settings",
                    ["help_test"] = "[color #FFFF00]/raidalert test[/color] - Test notifications",
                    ["help_clear"] = "[color #FFFF00]/raidalert clear[/color] - Clear all settings",
                    ["help_lang"] = "[color #FFFF00]/raidalert lang <en|ru>[/color] - Change language",
                    ["error_identify"] = "[color #FF0000]Error: Could not identify user[/color]",
                    ["telegram_saved"] = "[color #00FF00]Telegram ID saved: {0}[/color]",
                    ["telegram_check"] = "[color #FFD700]⚠️ Check your Telegram! Bot sent you verification code.[/color]",
                    ["telegram_copy"] = "[color #FFFF00]Copy code and use: /raidalert telegram verify CODE[/color]",
                    ["discord_saved"] = "[color #00FF00]Discord ID saved: {0}[/color]",
                    ["discord_check"] = "[color #FFD700]⚠️ Check your Discord DM! Bot sent you verification code.[/color]",
                    ["discord_copy"] = "[color #FFFF00]Copy code and use: /raidalert discord verify CODE[/color]",
                    ["vk_saved"] = "[color #00FF00]VK ID saved: {0}[/color]",
                    ["vk_check"] = "[color #FFD700]⚠️ Check your VK messages! Bot sent you verification code.[/color]",
                    ["vk_copy"] = "[color #FFFF00]Copy code and use: /raidalert vk verify CODE[/color]",
                    ["verify_success"] = "[color #00FF00]✅ {0} verified successfully! You can now set it as preferred.[/color]",
                    ["verify_failed"] = "[color #FF0000]❌ Verification failed. Code is invalid or expired.[/color]",
                    ["verify_error"] = "[color #FF0000]❌ Verification error. Please try again.[/color]",
                    ["no_account"] = "[color #FF0000]No account found. Please setup your service first.[/color]",
                    ["service_not_configured"] = "[color #FF0000]{0} not configured. Please set it up first.[/color]",
                    ["service_not_verified"] = "[color #FF0000]{0} not verified. Please verify it first.[/color]",
                    ["preferred_set"] = "[color #00FF00]✅ Preferred notification service set to: {0}[/color]",
                    ["preferred_info"] = "[color #FFFF00]Only {0} will receive notifications now[/color]",
                    ["clan_enabled"] = "[color #00FF00]Clan notifications enabled[/color]",
                    ["clan_disabled"] = "[color #00FF00]Clan notifications disabled[/color]",
                    ["no_notifications"] = "[color #FF0000]No notifications configured[/color]",
                    ["use_raidalert"] = "[color #FFFF00]Use /raidalert to set up notifications[/color]",
                    ["status_header"] = "[color #00FF00]═══ Your Notifications ═══[/color]",
                    ["status_telegram"] = "[color #00BFFF]Telegram: {0} ({1})[/color]",
                    ["status_discord"] = "[color #7289DA]Discord: {0} ({1})[/color]",
                    ["status_vk"] = "[color #4C75A3]VK: {0} ({1})[/color]",
                    ["status_preferred"] = "[color #FFD700]⭐ Preferred Service: {0}[/color]",
                    ["status_clan"] = "[color #FFD700]Clan notifications: {0}[/color]",
                    ["status_lang"] = "[color #FFD700]Language: {0}[/color]",
                    ["verified"] = "✅ VERIFIED",
                    ["not_verified"] = "⚠️ NOT VERIFIED",
                    ["on"] = "ON",
                    ["off"] = "OFF",
                    ["none"] = "NONE",
                    ["no_services"] = "[color #FF0000]⚠️ No services connected![/color]",
                    ["verify_required"] = "[color #FFD700]⚠️ Please verify a service and set it as preferred![/color]",
                    ["test_sent"] = "[color #00FF00]Test alert sent to {0}![/color]",
                    ["settings_cleared"] = "[color #FF0000]All notification settings cleared[/color]",
                    ["no_settings"] = "[color #FFFF00]No settings to clear[/color]",
                    ["lang_changed"] = "[color #00FF00]Language changed to: {0}[/color]",
                    ["lang_invalid"] = "[color #FF0000]Invalid language. Use: en or ru[/color]",
                    ["test_message"] = "[{0}] ✅ Test notification! Your raid alerts are working!",
                    ["raid_message"] = "[{0}] 🚨 RAID by {1} at {2}",
                    ["raid_message_no_loc"] = "[{0}] 🚨 RAID by {1}",
                    ["raid_destroyed"] = "[{0}] 💥 Your structure DESTROYED by {1} at {2}",
                    ["raid_destroyed_no_loc"] = "[{0}] 💥 Your structure DESTROYED by {1}",
                    ["clan_raid"] = "[{0}] 🚨 Ally {1}'s base raided by {2} at {3}!",
                    ["clan_raid_no_loc"] = "[{0}] 🚨 Ally {1}'s base raided by {2}!",
                    ["test_mode_enabled"] = "[color #FF6600]Test mode enabled[/color]",
                    ["test_mode_disabled"] = "[color #FF6600]Test mode disabled[/color]",
                    ["admin_only"] = "[color #FF0000]Admin only command[/color]",
                    ["test_mode_off"] = "[color #FF0000]Test mode is disabled[/color]",
                    ["code_send_error"] = "[color #FF0000]❌ Failed to send code. Check that notification service is running![/color]",
                    ["code_send_success"] = "[color #00FF00]✅ Code sent successfully![/color]",
                    ["no_preferred"] = "[color #FF0000]No preferred service set! Use /raidalert preferred <service>[/color]"
                },
                ["ru"] = new Dictionary<string, string>
                {
                    ["help_header"] = "[color #00FF00]═══ Команды RaidAlert ═══[/color]",
                    ["help_telegram"] = "[color #FFFF00]/raidalert telegram <id>[/color] - Подключить Telegram",
                    ["help_discord"] = "[color #FFFF00]/raidalert discord <id>[/color] - Подключить Discord",
                    ["help_vk"] = "[color #FFFF00]/raidalert vk <id>[/color] - Подключить VK",
                    ["help_verify"] = "[color #FFD700]/raidalert <сервис> verify <код>[/color] - Подтвердить сервис",
                    ["help_preferred"] = "[color #FFD700]/raidalert preferred <сервис>[/color] - Установить предпочитаемый сервис",
                    ["help_clan"] = "[color #FFFF00]/raidalert clan[/color] - Переключить уведомления клана",
                    ["help_status"] = "[color #FFFF00]/raidalert status[/color] - Показать настройки",
                    ["help_test"] = "[color #FFFF00]/raidalert test[/color] - Тест уведомлений",
                    ["help_clear"] = "[color #FFFF00]/raidalert clear[/color] - Очистить все настройки",
                    ["help_lang"] = "[color #FFFF00]/raidalert lang <en|ru>[/color] - Сменить язык",
                    ["error_identify"] = "[color #FF0000]Ошибка: Не удалось идентифицировать пользователя[/color]",
                    ["telegram_saved"] = "[color #00FF00]Telegram ID сохранен: {0}[/color]",
                    ["telegram_check"] = "[color #FFD700]⚠️ Проверь Telegram! Бот отправил тебе код подтверждения.[/color]",
                    ["telegram_copy"] = "[color #FFFF00]Скопируй код и используй: /raidalert telegram verify КОД[/color]",
                    ["discord_saved"] = "[color #00FF00]Discord ID сохранен: {0}[/color]",
                    ["discord_check"] = "[color #FFD700]⚠️ Проверь Discord ЛС! Бот отправил тебе код подтверждения.[/color]",
                    ["discord_copy"] = "[color #FFFF00]Скопируй код и используй: /raidalert discord verify КОД[/color]",
                    ["vk_saved"] = "[color #00FF00]VK ID сохранен: {0}[/color]",
                    ["vk_check"] = "[color #FFD700]⚠️ Проверь сообщения VK! Бот отправил тебе код подтверждения.[/color]",
                    ["vk_copy"] = "[color #FFFF00]Скопируй код и используй: /raidalert vk verify КОД[/color]",
                    ["verify_success"] = "[color #00FF00]✅ {0} успешно подтвержден! Теперь можешь установить его как предпочитаемый.[/color]",
                    ["verify_failed"] = "[color #FF0000]❌ Подтверждение не удалось. Код неверный или устарел.[/color]",
                    ["verify_error"] = "[color #FF0000]❌ Ошибка подтверждения. Попробуй еще раз.[/color]",
                    ["no_account"] = "[color #FF0000]Аккаунт не найден. Сначала настрой сервис.[/color]",
                    ["service_not_configured"] = "[color #FF0000]{0} не настроен. Сначала настрой его.[/color]",
                    ["service_not_verified"] = "[color #FF0000]{0} не подтвержден. Сначала подтверди его.[/color]",
                    ["preferred_set"] = "[color #00FF00]✅ Предпочитаемый сервис установлен: {0}[/color]",
                    ["preferred_info"] = "[color #FFFF00]Только {0} будет получать уведомления[/color]",
                    ["clan_enabled"] = "[color #00FF00]Уведомления клана включены[/color]",
                    ["clan_disabled"] = "[color #00FF00]Уведомления клана выключены[/color]",
                    ["no_notifications"] = "[color #FF0000]Уведомления не настроены[/color]",
                    ["use_raidalert"] = "[color #FFFF00]Используй /raidalert для настройки уведомлений[/color]",
                    ["status_header"] = "[color #00FF00]═══ Твои уведомления ═══[/color]",
                    ["status_telegram"] = "[color #00BFFF]Telegram: {0} ({1})[/color]",
                    ["status_discord"] = "[color #7289DA]Discord: {0} ({1})[/color]",
                    ["status_vk"] = "[color #4C75A3]VK: {0} ({1})[/color]",
                    ["status_preferred"] = "[color #FFD700]⭐ Предпочитаемый сервис: {0}[/color]",
                    ["status_clan"] = "[color #FFD700]Уведомления клана: {0}[/color]",
                    ["status_lang"] = "[color #FFD700]Язык: {0}[/color]",
                    ["verified"] = "✅ ПОДТВЕРЖДЕН",
                    ["not_verified"] = "⚠️ НЕ ПОДТВЕРЖДЕН",
                    ["on"] = "ВКЛ",
                    ["off"] = "ВЫКЛ",
                    ["none"] = "НЕТ",
                    ["no_services"] = "[color #FF0000]⚠️ Нет подключенных сервисов![/color]",
                    ["verify_required"] = "[color #FFD700]⚠️ Подтверди сервис и установи его как предпочитаемый![/color]",
                    ["test_sent"] = "[color #00FF00]Тестовое уведомление отправлено на {0}![/color]",
                    ["settings_cleared"] = "[color #FF0000]Все настройки уведомлений очищены[/color]",
                    ["no_settings"] = "[color #FFFF00]Нет настроек для очистки[/color]",
                    ["lang_changed"] = "[color #00FF00]Язык изменен на: {0}[/color]",
                    ["lang_invalid"] = "[color #FF0000]Неверный язык. Используй: en или ru[/color]",
                    ["test_message"] = "[{0}] ✅ Тестовое уведомление! Рейд алерты работают!",
                    ["raid_message"] = "[{0}] 🚨 РЕЙД от {1} в {2}",
                    ["raid_message_no_loc"] = "[{0}] 🚨 РЕЙД от {1}",
                    ["raid_destroyed"] = "[{0}] 💥 Твоя постройка УНИЧТОЖЕНА игроком {1} в {2}",
                    ["raid_destroyed_no_loc"] = "[{0}] 💥 Твоя постройка УНИЧТОЖЕНА игроком {1}",
                    ["clan_raid"] = "[{0}] 🚨 База союзника {1} рейдится игроком {2} в {3}!",
                    ["clan_raid_no_loc"] = "[{0}] 🚨 База союзника {1} рейдится игроком {2}!",
                    ["test_mode_enabled"] = "[color #FF6600]Тестовый режим включен[/color]",
                    ["test_mode_disabled"] = "[color #FF6600]Тестовый режим выключен[/color]",
                    ["admin_only"] = "[color #FF0000]Только для администраторов[/color]",
                    ["test_mode_off"] = "[color #FF0000]Тестовый режим отключен[/color]",
                    ["code_send_error"] = "[color #FF0000]❌ Не удалось отправить код. Проверь что notification service запущен![/color]",
                    ["code_send_success"] = "[color #00FF00]✅ Код успешно отправлен![/color]",
                    ["no_preferred"] = "[color #FF0000]Не установлен предпочитаемый сервис! Используй /raidalert preferred <сервис>[/color]"
                }
            };

            public static string Get(string lang, string key, params object[] args)
            {
                if (!Texts.ContainsKey(lang))
                    lang = "en";
                
                if (!Texts[lang].ContainsKey(key))
                    return key;

                string text = Texts[lang][key];
                if (args.Length > 0)
                    return string.Format(text, args);
                
                return text;
            }
        }

        void Loaded()
        {
            config = Config.ReadObject<Configuration>();
            if (config == null)
            {
                config = GetDefaultConfig();
                SaveConfig();
            }

            RaidData = Interface.Oxide.DataFileSystem
                .ReadObject<Dictionary<string, RaidIDs>>("RaidAlert");

            if (RaidData == null)
                RaidData = new Dictionary<string, RaidIDs>();

            Puts(string.Format("RaidReport v4.0.0 loaded with {0} registered users", RaidData.Count));
            Puts(string.Format("Notification Service URL: {0}", config.NotificationServiceURL));
            Puts(string.Format("Notify only on destruction: {0}", config.NotifyOnlyOnDestruction));
            
            if (config.TestMode)
                Puts("⚠️ TEST MODE ENABLED - You can raid your own structures!");
            
            if (config.DebugMode)
                Puts("🔍 DEBUG MODE ENABLED - Detailed logging active");
        }

        void SaveData()
        {
            try
            {
                Interface.Oxide.DataFileSystem.WriteObject("RaidAlert", RaidData);
            }
            catch (System.Exception ex)
            {
                Puts(string.Format("❌ Failed to save data: {0}", ex.Message));
            }
        }

        void SaveConfig()
        {
            Config.WriteObject(config, true);
        }

        string GetUserKey(NetUser user)
        {
            if (user == null) return null;

            var u = Users.GetBySteamID(user.userID);
            if (u != null && !string.IsNullOrEmpty(u.HWID))
                return u.HWID;

            return user.userID.ToString();
        }

        string GetUserKeyByID(ulong userID)
        {
            var u = Users.GetBySteamID(userID);
            if (u != null && !string.IsNullOrEmpty(u.HWID))
                return u.HWID;

            return userID.ToString();
        }

        string GetLang(NetUser user)
        {
            string key = GetUserKey(user);
            if (key != null && RaidData.ContainsKey(key))
                return RaidData[key].lang;
            return "en";
        }

        string GenerateCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new System.Random();
            return new string(Enumerable.Repeat(chars, 8)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        void DebugLog(string message)
        {
            if (config.DebugMode)
                Puts($"[DEBUG] {message}");
        }

        #endregion

        #region Commands

        [ChatCommand("raidalert")]
        void cmdRaidAlert(NetUser netuser, string command, string[] args)
        {
            if (args.Length == 0)
            {
                ShowHelp(netuser);
                return;
            }

            string key = GetUserKey(netuser);
            if (key == null)
            {
                SendMessage(netuser, Messages.Get(GetLang(netuser), "error_identify"));
                return;
            }

            string cmd = args[0].ToLower();

            switch (cmd)
            {
                case "telegram":
                case "tg":
                    HandleTelegramCommand(netuser, key, args);
                    break;

                case "discord":
                case "ds":
                    HandleDiscordCommand(netuser, key, args);
                    break;

                case "vk":
                    HandleVKCommand(netuser, key, args);
                    break;

                case "preferred":
                case "pref":
                    if (args.Length >= 2)
                        SetPreferredService(netuser, key, args[1]);
                    else
                        SendMessage(netuser, "[color #FF0000]Usage: /raidalert preferred <telegram|discord|vk>[/color]");
                    break;

                case "clan":
                    ToggleClan(netuser, key);
                    break;

                case "status":
                case "info":
                    ShowStatus(netuser, key);
                    break;

                case "test":
                    TestAlert(netuser, key);
                    break;

                case "clear":
                    ClearSettings(netuser, key);
                    break;

                case "lang":
                case "language":
                    if (args.Length >= 2)
                        SetLanguage(netuser, key, args[1]);
                    else
                        SendMessage(netuser, Messages.Get(GetLang(netuser), "lang_invalid"));
                    break;

                case "fakeraid":
                    if (config.TestMode)
                        FakeRaid(netuser);
                    else
                        SendMessage(netuser, Messages.Get(GetLang(netuser), "test_mode_off"));
                    break;

                case "testmode":
                    if (netuser.admin)
                        ToggleTestMode(netuser);
                    else
                        SendMessage(netuser, Messages.Get(GetLang(netuser), "admin_only"));
                    break;

                case "debug":
                    if (netuser.admin)
                        ToggleDebugMode(netuser);
                    else
                        SendMessage(netuser, Messages.Get(GetLang(netuser), "admin_only"));
                    break;

                default:
                    ShowHelp(netuser);
                    break;
            }
        }

        void SetLanguage(NetUser user, string key, string lang)
        {
            lang = lang.ToLower();
            if (lang != "en" && lang != "ru")
            {
                SendMessage(user, Messages.Get(GetLang(user), "lang_invalid"));
                return;
            }

            if (!RaidData.ContainsKey(key))
                RaidData[key] = new RaidIDs();

            RaidData[key].lang = lang;
            SaveData();

            SendMessage(user, Messages.Get(lang, "lang_changed", lang.ToUpper()));
            Puts(string.Format("User {0} changed language to {1}", user.displayName, lang));
        }

        void SetPreferredService(NetUser user, string key, string service)
        {
            string lang = GetLang(user);
            service = service.ToLower();

            if (service != "telegram" && service != "discord" && service != "vk")
            {
                SendMessage(user, "[color #FF0000]Invalid service. Use: telegram, discord, or vk[/color]");
                return;
            }

            if (!RaidData.ContainsKey(key))
            {
                SendMessage(user, Messages.Get(lang, "no_account"));
                return;
            }

            var data = RaidData[key];
            string serviceId = data.GetServiceId(service);

            if (string.IsNullOrEmpty(serviceId))
            {
                SendMessage(user, Messages.Get(lang, "service_not_configured", service));
                return;
            }

            if (!data.IsServiceVerified(service))
            {
                SendMessage(user, Messages.Get(lang, "service_not_verified", service));
                return;
            }

            data.preferredService = service;
            SaveData();

            SendMessage(user, Messages.Get(lang, "preferred_set", service.ToUpper()));
            SendMessage(user, Messages.Get(lang, "preferred_info", service.ToUpper()));
            Puts(string.Format("User {0} set preferred service to {1}", user.displayName, service));
        }

        void HandleTelegramCommand(NetUser user, string key, string[] args)
        {
            string lang = GetLang(user);

            if (args.Length < 2)
            {
                SendMessage(user, "[color #FF0000]Usage: /raidalert telegram <chat_id>[/color]");
                SendMessage(user, "[color #FF0000]Or: /raidalert telegram verify <code>[/color]");
                return;
            }

            if (args[1].ToLower() == "verify")
            {
                if (args.Length < 3)
                {
                    SendMessage(user, "[color #FF0000]Usage: /raidalert telegram verify <code>[/color]");
                    return;
                }
                VerifyService(user, key, "telegram", args[2]);
            }
            else
            {
                SetTelegram(user, key, args[1]);
            }
        }

        void HandleDiscordCommand(NetUser user, string key, string[] args)
        {
            string lang = GetLang(user);

            if (args.Length < 2)
            {
                SendMessage(user, "[color #FF0000]Usage: /raidalert discord <user_id>[/color]");
                SendMessage(user, "[color #FF0000]Or: /raidalert discord verify <code>[/color]");
                return;
            }

            if (args[1].ToLower() == "verify")
            {
                if (args.Length < 3)
                {
                    SendMessage(user, "[color #FF0000]Usage: /raidalert discord verify <code>[/color]");
                    return;
                }
                VerifyService(user, key, "discord", args[2]);
            }
            else
            {
                SetDiscord(user, key, args[1]);
            }
        }

        void HandleVKCommand(NetUser user, string key, string[] args)
        {
            string lang = GetLang(user);

            if (args.Length < 2)
            {
                SendMessage(user, "[color #FF0000]Usage: /raidalert vk <user_id or screen_name>[/color]");
                SendMessage(user, "[color #FF0000]Or: /raidalert vk verify <code>[/color]");
                return;
            }

            if (args[1].ToLower() == "verify")
            {
                if (args.Length < 3)
                {
                    SendMessage(user, "[color #FF0000]Usage: /raidalert vk verify <code>[/color]");
                    return;
                }
                VerifyService(user, key, "vk", args[2]);
            }
            else
            {
                SetVK(user, key, args[1]);
            }
        }

        void SendMessage(NetUser user, string message)
        {
            if (user != null)
                rust.SendChatMessage(user, ChatName, message);
        }

        void ShowHelp(NetUser user)
        {
            string lang = GetLang(user);
            SendMessage(user, Messages.Get(lang, "help_header"));
            SendMessage(user, Messages.Get(lang, "help_telegram"));
            SendMessage(user, Messages.Get(lang, "help_discord"));
            SendMessage(user, Messages.Get(lang, "help_vk"));
            SendMessage(user, Messages.Get(lang, "help_verify"));
            SendMessage(user, Messages.Get(lang, "help_preferred"));
            SendMessage(user, Messages.Get(lang, "help_clan"));
            SendMessage(user, Messages.Get(lang, "help_status"));
            SendMessage(user, Messages.Get(lang, "help_test"));
            SendMessage(user, Messages.Get(lang, "help_clear"));
            SendMessage(user, Messages.Get(lang, "help_lang"));

            if (config.TestMode)
            {
                SendMessage(user, "[color #FF6600]TEST COMMANDS:[/color]");
                SendMessage(user, "[color #FF6600]/raidalert fakeraid[/color] - Simulate raid");
                if (user.admin)
                {
                    SendMessage(user, "[color #FF6600]/raidalert testmode[/color] - Toggle test mode");
                    SendMessage(user, "[color #FF6600]/raidalert debug[/color] - Toggle debug mode");
                }
            }
        }

        void SetTelegram(NetUser user, string key, string chatId)
        {
            string lang = GetLang(user);

            if (!RaidData.ContainsKey(key))
                RaidData[key] = new RaidIDs();

            RaidData[key].telegram = chatId;
            RaidData[key].telegramVerified = false;
            SaveData();

            SendMessage(user, Messages.Get(lang, "telegram_saved", chatId));

            string code = GenerateCode();
            RequestCodeFromBot(user, "telegram", chatId, code);

            Puts(string.Format("User {0} connected Telegram: {1} (code: {2})", user.displayName, chatId, code));
        }

        void SetDiscord(NetUser user, string key, string userId)
        {
            string lang = GetLang(user);

            if (!RaidData.ContainsKey(key))
                RaidData[key] = new RaidIDs();

            RaidData[key].discord = userId;
            RaidData[key].discordVerified = false;
            SaveData();

            SendMessage(user, Messages.Get(lang, "discord_saved", userId));

            string code = GenerateCode();
            RequestCodeFromBot(user, "discord", userId, code);

            Puts(string.Format("User {0} connected Discord: {1} (code: {2})", user.displayName, userId, code));
        }

        void SetVK(NetUser user, string key, string userId)
        {
            string lang = GetLang(user);

            if (!RaidData.ContainsKey(key))
                RaidData[key] = new RaidIDs();

            RaidData[key].vk = userId;
            RaidData[key].vkVerified = false;
            SaveData();

            SendMessage(user, Messages.Get(lang, "vk_saved", userId));

            string code = GenerateCode();
            RequestCodeFromBot(user, "vk", userId, code);

            Puts(string.Format("User {0} connected VK: {1} (code: {2})", user.displayName, userId, code));
        }

        void RequestCodeFromBot(NetUser user, string service, string userId, string code)
        {
            string lang = GetLang(user);
            
            string url = config.NotificationServiceURL + "/send-code";
            
            var payload = new
            {
                service = service,
                user = userId,
                code = code
            };

            string json = JsonConvert.SerializeObject(payload);
            
            Puts("═══════════════════════════════════════");
            Puts($"🔵 SENDING CODE REQUEST:");
            Puts($"   URL: {url}");
            Puts($"   Service: {service}");
            Puts($"   User ID: {userId}");
            Puts($"   Code: {code}");
            Puts($"   JSON: {json}");
            Puts("═══════════════════════════════════════");

            var headers = new Dictionary<string, string>();
            headers.Add("Content-Type", "application/json");

            webrequest.EnqueuePost(url, json, (statusCode, response) =>
            {
                Puts("═══════════════════════════════════════");
                Puts($"🔵 RESPONSE FROM CODE REQUEST:");
                Puts($"   Status Code: {statusCode}");
                Puts($"   Response: {response}");
                Puts("═══════════════════════════════════════");

                if (statusCode == 200)
                {
                    Puts($"✅ Verification code sent to {service} user {userId}");
                    
                    switch(service)
                    {
                        case "telegram":
                            SendMessage(user, Messages.Get(lang, "telegram_check"));
                            SendMessage(user, Messages.Get(lang, "telegram_copy"));
                            break;
                        case "discord":
                            SendMessage(user, Messages.Get(lang, "discord_check"));
                            SendMessage(user, Messages.Get(lang, "discord_copy"));
                            break;
                        case "vk":
                            SendMessage(user, Messages.Get(lang, "vk_check"));
                            SendMessage(user, Messages.Get(lang, "vk_copy"));
                            break;
                    }
                }
                else if (statusCode == 0)
                {
                    Puts($"❌ Failed to connect to notification service for {service}");
                    Puts($"Error: {response}");
                    SendMessage(user, Messages.Get(lang, "code_send_error"));
                    SendMessage(user, "[color #FFFF00]Make sure the notification service is running on " + config.NotificationServiceURL + "[/color]");
                }
                else
                {
                    Puts($"❌ Failed to send code to {service}: {statusCode} - {response}");
                    SendMessage(user, Messages.Get(lang, "code_send_error"));
                }
            }, this, headers);
        }

        void VerifyService(NetUser user, string key, string service, string code)
        {
            string lang = GetLang(user);

            if (!RaidData.ContainsKey(key))
            {
                SendMessage(user, Messages.Get(lang, "no_account"));
                return;
            }

            var data = RaidData[key];
            string userId = data.GetServiceId(service);

            if (string.IsNullOrEmpty(userId))
            {
                SendMessage(user, Messages.Get(lang, "service_not_configured", service));
                return;
            }

            string url = config.NotificationServiceURL + "/verify";

            var payload = new
            {
                service = service.ToLower(),
                user = userId,
                code = code.ToUpper()
            };

            string json = JsonConvert.SerializeObject(payload);
            
            Puts("═══════════════════════════════════════");
            Puts($"🔵 SENDING VERIFY REQUEST:");
            Puts($"   URL: {url}");
            Puts($"   Service: {service}");
            Puts($"   User ID: {userId}");
            Puts($"   Code: {code}");
            Puts($"   JSON: {json}");
            Puts("═══════════════════════════════════════");
            
            var headers = new Dictionary<string, string>();
            headers.Add("Content-Type", "application/json");

            webrequest.EnqueuePost(url, json, (statusCode, response) =>
            {
                Puts("═══════════════════════════════════════");
                Puts($"🔵 RESPONSE FROM VERIFY REQUEST:");
                Puts($"   Status Code: {statusCode}");
                Puts($"   Response: {response}");
                Puts("═══════════════════════════════════════");

                if (statusCode == 200)
                {
                    try
                    {
                        var result = JsonConvert.DeserializeObject<Dictionary<string, object>>(response);
                        bool success = result.ContainsKey("success") && (bool)result["success"];

                        if (success)
                        {
                            switch (service.ToLower())
                            {
                                case "telegram":
                                    data.telegramVerified = true;
                                    break;
                                case "discord":
                                    data.discordVerified = true;
                                    break;
                                case "vk":
                                    data.vkVerified = true;
                                    break;
                            }
                            SaveData();
                            SendMessage(user, Messages.Get(lang, "verify_success", service.ToUpper()));
                            Puts($"User {user.displayName} verified {service}");
                        }
                        else
                        {
                            SendMessage(user, Messages.Get(lang, "verify_failed"));
                        }
                    }
                    catch (System.Exception ex)
                    {
                        Puts($"Failed to parse verification response: {ex.Message}");
                        SendMessage(user, Messages.Get(lang, "verify_error"));
                    }
                }
                else
                {
                    SendMessage(user, Messages.Get(lang, "verify_error"));
                    Puts($"Verification request failed: {statusCode} - {response}");
                }
            }, this, headers);
        }

        void ToggleClan(NetUser user, string key)
        {
            string lang = GetLang(user);

            if (!RaidData.ContainsKey(key))
                RaidData[key] = new RaidIDs();

            RaidData[key].clan = !RaidData[key].clan;
            SaveData();

            if (RaidData[key].clan)
                SendMessage(user, Messages.Get(lang, "clan_enabled"));
            else
                SendMessage(user, Messages.Get(lang, "clan_disabled"));
        }

        void ShowStatus(NetUser user, string key)
        {
            string lang = GetLang(user);

            if (!RaidData.ContainsKey(key))
            {
                SendMessage(user, Messages.Get(lang, "no_notifications"));
                SendMessage(user, Messages.Get(lang, "use_raidalert"));
                return;
            }

            var data = RaidData[key];
            SendMessage(user, Messages.Get(lang, "status_header"));

            if (!string.IsNullOrEmpty(data.telegram))
            {
                string status = data.telegramVerified ? Messages.Get(lang, "verified") : Messages.Get(lang, "not_verified");
                SendMessage(user, Messages.Get(lang, "status_telegram", data.telegram, status));
            }

            if (!string.IsNullOrEmpty(data.discord))
            {
                string status = data.discordVerified ? Messages.Get(lang, "verified") : Messages.Get(lang, "not_verified");
                SendMessage(user, Messages.Get(lang, "status_discord", data.discord, status));
            }

            if (!string.IsNullOrEmpty(data.vk))
            {
                string status = data.vkVerified ? Messages.Get(lang, "verified") : Messages.Get(lang, "not_verified");
                SendMessage(user, Messages.Get(lang, "status_vk", data.vk, status));
            }

            string preferredDisplay = string.IsNullOrEmpty(data.preferredService) 
                ? Messages.Get(lang, "none") 
                : data.preferredService.ToUpper();
            SendMessage(user, Messages.Get(lang, "status_preferred", preferredDisplay));

            string clanStatus = data.clan ? Messages.Get(lang, "on") : Messages.Get(lang, "off");
            SendMessage(user, Messages.Get(lang, "status_clan", clanStatus));
            SendMessage(user, Messages.Get(lang, "status_lang", data.lang.ToUpper()));

            if (!data.HasAnyService())
                SendMessage(user, Messages.Get(lang, "no_services"));
            else if (!data.HasVerifiedService() || string.IsNullOrEmpty(data.preferredService))
                SendMessage(user, Messages.Get(lang, "verify_required"));
        }

        void TestAlert(NetUser user, string key)
        {
            string lang = GetLang(user);

            if (!RaidData.ContainsKey(key))
            {
                SendMessage(user, Messages.Get(lang, "no_notifications"));
                return;
            }

            var data = RaidData[key];
            
            if (string.IsNullOrEmpty(data.preferredService))
            {
                SendMessage(user, Messages.Get(lang, "no_preferred"));
                return;
            }

            if (!data.IsServiceVerified(data.preferredService))
            {
                SendMessage(user, Messages.Get(lang, "verify_required"));
                return;
            }

            string testMessage = Messages.Get(lang, "test_message", config.ServerIdentifier);

            SendToPreferredService(testMessage, data);
            SendMessage(user, Messages.Get(lang, "test_sent", data.preferredService.ToUpper()));
        }

        void ClearSettings(NetUser user, string key)
        {
            string lang = GetLang(user);

            if (RaidData.ContainsKey(key))
            {
                RaidData.Remove(key);
                SaveData();
                SendMessage(user, Messages.Get(lang, "settings_cleared"));
                Puts($"User {user.displayName} cleared their settings");
            }
            else
            {
                SendMessage(user, Messages.Get(lang, "no_settings"));
            }
        }

        void FakeRaid(NetUser user)
        {
            Vector3 pos = user.playerClient.controllable.transform.position;
            string location = GetLocationName(pos);
            string lang = GetLang(user);
            string attackerName = user.displayName;

            string msg;
            if (config.PrintLocation)
                msg = $"[{config.ServerIdentifier}] 🧪 FAKE RAID TEST by {attackerName} at {location}!";
            else
                msg = $"[{config.ServerIdentifier}] 🧪 FAKE RAID TEST by {attackerName}!";

            SendRaidMessage(user, msg, attackerName);
            NotifyClan(user, attackerName, location);

            SendMessage(user, "[color #FF6600]Fake raid alert triggered![/color]");
            Puts($"Fake raid triggered by {user.displayName} at {location}");
        }

        void ToggleTestMode(NetUser user)
        {
            string lang = GetLang(user);
            config.TestMode = !config.TestMode;
            SaveConfig();
            
            if (config.TestMode)
                SendMessage(user, Messages.Get(lang, "test_mode_enabled"));
            else
                SendMessage(user, Messages.Get(lang, "test_mode_disabled"));

            Puts($"Test mode {(config.TestMode ? "enabled" : "disabled")} by {user.displayName}");
        }

        void ToggleDebugMode(NetUser user)
        {
            config.DebugMode = !config.DebugMode;
            SaveConfig();
            
            string status = config.DebugMode ? "enabled" : "disabled";
            SendMessage(user, $"[color #FF6600]Debug mode {status}[/color]");
            Puts($"Debug mode {status} by {user.displayName}");
        }

        #endregion

        #region Raid Detection

        private void OnKilled(TakeDamage takeDamage, DamageEvent damage)
        {
            try
            {
                if (damage.victim.idMain == null || damage.attacker.idMain == null)
                    return;

                NetUser attacker = damage.attacker.client?.netUser;
                if (attacker == null)
                    return;

                // Check if it's explosive damage (or weapon in test mode)
                bool isExplosive = damage.damageTypes == DamageTypeFlags.damage_explosion;
                bool isWeapon = damage.attacker.id is WeaponImpact;

                if (config.TestMode)
                {
                    if (!isExplosive && !isWeapon)
                        return;
                }
                else
                {
                    if (!isExplosive)
                        return;
                }

                // Check if it's a structure or deployable
                StructureComponent structure = damage.victim.idMain as StructureComponent;
                DeployableObject deployable = damage.victim.idMain as DeployableObject;

                if (structure == null && deployable == null)
                    return;

                ulong ownerID = 0;
                Vector3 pos = Vector3.zero;

                if (structure != null)
                {
                    ownerID = structure._master.ownerID;
                    pos = structure.transform.position;
                }
                else if (deployable != null)
                {
                    ownerID = deployable.ownerID;
                    pos = deployable.transform.position;
                }

                // Don't notify if attacker is the owner
               Puts("1");

                string attackerName = attacker.displayName;
                string location = GetLocationName(pos);

                // Get owner's user key (HWID or SteamID)
                string ownerKey = GetUserKeyByID(ownerID);
                if (ownerKey == null || !RaidData.ContainsKey(ownerKey))
                {
                    Puts($"No raid data found for owner ID {ownerID}");
                    return;
                }

                var data = RaidData[ownerKey];
                string lang = data.lang;

                // Check if user has preferred service configured
                if (string.IsNullOrEmpty(data.preferredService))
                {
                    DebugLog($"Owner {ownerID} has no preferred service set");
                    return;
                }

                if (!data.IsServiceVerified(data.preferredService))
                {
                    DebugLog($"Owner {ownerID}'s preferred service is not verified");
                    return;
                }
  Puts("2");
                // Handle cooldown for destruction notifications
                if (config.NotifyOnlyOnDestruction)
                {
                    string msg = BuildRaidMessage(lang, location, attackerName, true);
                    SendToPreferredService(msg, data);
                    NotifyClanByOwnerID(ownerID, attackerName, location);
                    Puts($"Structure destroyed! OwnerID: {ownerID}, Attacker: {attackerName}, Location: {location}");
                }
            }
            catch (System.Exception ex)
            {
                Puts($"Error in OnKilled: {ex.Message}");
            }
        }

        object ModifyDamage(TakeDamage takeDamage, DamageEvent damage)
        {
            // If we only notify on destruction, don't process damage events
            if (config.NotifyOnlyOnDestruction)
                return null;

            try
            {
                if (damage.victim.idMain == null || damage.attacker.idMain == null)
                    return null;

                NetUser attacker = damage.attacker.client?.netUser;
                if (attacker == null)
                    return null;

                // Check if it's explosive damage (or weapon in test mode)
                bool isExplosive = damage.damageTypes == DamageTypeFlags.damage_explosion;
                bool isWeapon = damage.attacker.id is WeaponImpact;

                if (config.TestMode)
                {
                    if (!isExplosive && !isWeapon)
                        return null;
                }
                else
                {
                    if (!isExplosive)
                        return null;
                }

                // Check if it's a structure or deployable
                StructureComponent structure = damage.victim.idMain as StructureComponent;
                DeployableObject deployable = damage.victim.idMain as DeployableObject;

                if (structure == null && deployable == null)
                    return null;

                ulong ownerID = 0;
                Vector3 pos = Vector3.zero;

                if (structure != null)
                {
                    ownerID = structure._master.ownerID;
                    pos = structure.transform.position;
                }
                else if (deployable != null)
                {
                    ownerID = deployable.ownerID;
                    pos = deployable.transform.position;
                }

                // Don't notify if attacker is the owner
                if (attacker.userID == ownerID)
                    return null;

                // Check cooldown
                float currentTime = Time.time;
                if (lastNotificationTime.ContainsKey(ownerID))
                {
                    float timeSinceLastNotification = currentTime - lastNotificationTime[ownerID];
                    if (timeSinceLastNotification < config.NotificationCooldown)
                        return null;
                }

                lastNotificationTime[ownerID] = currentTime;

                string attackerName = attacker.displayName;
                string location = GetLocationName(pos);

                // Get owner's user key (HWID or SteamID)
                string ownerKey = GetUserKeyByID(ownerID);
                if (ownerKey == null || !RaidData.ContainsKey(ownerKey))
                {
                    DebugLog($"No raid data found for owner ID {ownerID}");
                    return null;
                }

                var data = RaidData[ownerKey];
                string lang = data.lang;

                // Check if user has preferred service configured
                if (string.IsNullOrEmpty(data.preferredService))
                {
                    DebugLog($"Owner {ownerID} has no preferred service set");
                    return null;
                }

                if (!data.IsServiceVerified(data.preferredService))
                {
                    DebugLog($"Owner {ownerID}'s preferred service is not verified");
                    return null;
                }

                string msg = BuildRaidMessage(lang, location, attackerName, false);
                SendToPreferredService(msg, data);
                NotifyClanByOwnerID(ownerID, attackerName, location);

                Puts($"Raid detected! OwnerID: {ownerID}, Attacker: {attackerName}, Location: {location}");
            }
            catch (System.Exception ex)
            {
                Puts($"Error in ModifyDamage: {ex.Message}");
            }

            return null;
        }

        string GetLocationName(Vector3 pos)
        {
            if (Location != null && config.PrintLocation)
            {
                var loc = Location.Call("FindLocationName", pos);
                if (loc != null)
                    return loc.ToString();
            }
            return "Unknown";
        }

        string BuildRaidMessage(string lang, string location, string attackerName, bool isDestroyed)
        {
            string msg;
            
            if (isDestroyed)
            {
                if (config.PrintLocation)
                    msg = Messages.Get(lang, "raid_destroyed", config.ServerIdentifier, attackerName, location);
                else
                    msg = Messages.Get(lang, "raid_destroyed_no_loc", config.ServerIdentifier, attackerName);
            }
            else
            {
                if (config.PrintLocation)
                    msg = Messages.Get(lang, "raid_message", config.ServerIdentifier, attackerName, location);
                else
                    msg = Messages.Get(lang, "raid_message_no_loc", config.ServerIdentifier, attackerName);
            }

            if (config.TestMode)
                msg = msg.Replace("RAID", "TEST RAID").Replace("РЕЙД", "ТЕСТ РЕЙД");

            return msg;
        }

        #endregion

        #region Notifications

        void SendRaidMessage(NetUser user, string message, string attackerName)
        {
            SendMessage(user, "[color #FF4500]" + message + "[/color]");

            string key = GetUserKey(user);
            if (key == null || !RaidData.ContainsKey(key))
            {
                DebugLog($"No raid data for user {user.displayName}");
                return;
            }

            var data = RaidData[key];
            
            if (string.IsNullOrEmpty(data.preferredService))
            {
                DebugLog($"User {user.displayName} has no preferred service set");
                return;
            }

            if (!data.IsServiceVerified(data.preferredService))
            {
                DebugLog($"User {user.displayName}'s preferred service is not verified");
                return;
            }

            SendToPreferredService(message, data);
        }

        void SendToPreferredService(string message, RaidIDs data)
        {
            string service = data.preferredService.ToLower();
            string userId = data.GetServiceId(service);

            if (string.IsNullOrEmpty(userId))
            {
                DebugLog($"No user ID found for preferred service: {service}");
                return;
            }

            SendWebRequest(service, userId, message, 0);
        }

        void SendWebRequest(string service, string userId, string message, int attemptCount)
        {
            string url = config.NotificationServiceURL + "/send";
            
            var payload = new
            {
                service = service,
                user = userId,
                message = message
            };

            string json = JsonConvert.SerializeObject(payload);
            
            Puts("═══════════════════════════════════════");
            Puts($"🔵 SENDING RAID ALERT [Attempt {attemptCount + 1}]:");
            Puts($"   URL: {url}");
            Puts($"   Service: {service}");
            Puts($"   User ID: {userId}");
            Puts($"   Message: {message}");
            Puts($"   JSON: {json}");
            Puts("═══════════════════════════════════════");
            
            var headers = new Dictionary<string, string>();
            headers.Add("Content-Type", "application/json");

            webrequest.EnqueuePost(url, json, (code, response) =>
            {
                Puts("═══════════════════════════════════════");
                Puts($"🔵 RESPONSE FROM RAID ALERT:");
                Puts($"   Status Code: {code}");
                Puts($"   Response: {response}");
                Puts("═══════════════════════════════════════");
                
                if (code == 200)
                {
                    Puts($"✅ Notification sent via {service} to {userId}");
                }
                else
                {
                    Puts($"❌ Failed to send {service} notification: {code} - {response}");

                    if (config.RetryFailedRequests && attemptCount < config.MaxRetryAttempts)
                    {
                        float delay = (float)System.Math.Pow(2, attemptCount);
                        timer.Once(delay, () =>
                        {
                            SendWebRequest(service, userId, message, attemptCount + 1);
                        });
                        Puts($"Retrying in {delay} seconds...");
                    }
                }
            }, this, headers);
        }

        void NotifyClan(NetUser owner, string attackerName, string location)
        {
            var u = Users.GetBySteamID(owner.userID);
            if (u == null || u.Clan == null)
                return;

            string lang = GetLang(owner);
            string clanMessage;
            
            if (config.PrintLocation)
                clanMessage = Messages.Get(lang, "clan_raid", config.ServerIdentifier, owner.displayName, attackerName, location);
            else
                clanMessage = Messages.Get(lang, "clan_raid_no_loc", config.ServerIdentifier, owner.displayName, attackerName);

            if (config.TestMode)
                clanMessage = clanMessage.Replace("RAID", "TEST RAID").Replace("РЕЙД", "ТЕСТ РЕЙД");

            int notified = 0;

            foreach (var m in u.Clan.Members)
            {
                NetUser member = NetUser.FindByUserID(m.Key.SteamID);
                if (member == null || member == owner)
                    continue;

                string key = GetUserKey(member);
                if (key == null || !RaidData.ContainsKey(key))
                    continue;

                if (!RaidData[key].clan)
                    continue;

                SendRaidMessage(member, clanMessage, attackerName);
                notified++;
            }

            if (notified > 0)
            {
                Puts($"Notified {notified} clan member(s) about raid on {owner.displayName}'s base by {attackerName}");
            }
        }

        void NotifyClanByOwnerID(ulong ownerID, string attackerName, string location)
        {
            var u = Users.GetBySteamID(ownerID);
            if (u == null || u.Clan == null)
                return;

            string ownerKey = GetUserKeyByID(ownerID);
            if (ownerKey == null || !RaidData.ContainsKey(ownerKey))
                return;

            string ownerName = u.Username;
            string lang = RaidData[ownerKey].lang;
            string clanMessage;
            
            if (config.PrintLocation)
                clanMessage = Messages.Get(lang, "clan_raid", config.ServerIdentifier, ownerName, attackerName, location);
            else
                clanMessage = Messages.Get(lang, "clan_raid_no_loc", config.ServerIdentifier, ownerName, attackerName);

            if (config.TestMode)
                clanMessage = clanMessage.Replace("RAID", "TEST RAID").Replace("РЕЙД", "ТЕСТ РЕЙД");

            int notified = 0;

            foreach (var m in u.Clan.Members)
            {
                if (m.Key.SteamID == ownerID)
                    continue;

                string memberKey = GetUserKeyByID(m.Key.SteamID);
                if (memberKey == null || !RaidData.ContainsKey(memberKey))
                    continue;

                var memberData = RaidData[memberKey];
                if (!memberData.clan)
                    continue;

                if (string.IsNullOrEmpty(memberData.preferredService) || !memberData.IsServiceVerified(memberData.preferredService))
                    continue;

                SendToPreferredService(clanMessage, memberData);
                notified++;
            }

            if (notified > 0)
            {
                Puts($"Notified {notified} clan member(s) about raid on {ownerName}'s base by {attackerName}");
            }
        }

        #endregion
    }
}