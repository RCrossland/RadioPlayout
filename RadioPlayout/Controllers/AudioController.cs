using RadioPlayout.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;

namespace RadioPlayout.Controllers
{
    public class AudioController : Controller
    {
		private RadioPlayoutDb _db = new RadioPlayoutDb();

		// GET: Audio
		public ViewResult Index(string sortOrder, string searchString, string currentSearchString, string audioType, string currentAudioType, string audioMinDuration, 
			string currentAudioMinDuration, string audioMaxDuration, string currentAudioMaxDuration, string audioYear, string currentAudioYear, int? page)
        {
			ViewBag.CurrentSort = sortOrder;
			ViewBag.ArtistNameSortParam = sortOrder == "artist_name" ? "artist_name_desc" : "artist_name";
			ViewBag.AudioTitleSortParam = sortOrder == "audio_title" ? "audio_title_desc" : "audio_title";
			ViewBag.AudioDurationSortParam = sortOrder == "audio_duration" ? "audio_duration_desc" : "audio_duration";

			// If the user has set a new filter go back to page 1
			if(searchString != null || audioType != null || audioMinDuration != null || audioMaxDuration != null || audioYear != null)
			{
				page = 1;
			}
			else
			{
				searchString = currentSearchString;
				audioType = currentAudioType;
				audioMinDuration = currentAudioMinDuration;
				audioMaxDuration = currentAudioMaxDuration;
				audioYear = currentAudioYear;
			}

			// Reset the ViewBag values
			ViewBag.currentSearchString = searchString;
			ViewBag.currentAudioType = audioType;
			ViewBag.currentAudioMinDuration = audioMinDuration;
			ViewBag.currentAudioMaxDuration = audioMaxDuration;
			ViewBag.currentAudioYear = audioYear;

			IQueryable<Audio> audio = _db.Audio;

			// Sort the audio items based on the searchString
			if (!String.IsNullOrWhiteSpace(searchString))
			{
				audio = audio.Where(r => r.ArtistName.Contains(searchString) || r.AudioTitle.Contains(searchString));
			}

			// Sort the audio items based on the audioType
			if (!String.IsNullOrWhiteSpace(audioType))
			{
				int audioTypeInt = Int32.Parse(audioType);
				audio = audio.Where(r => r.AudioType.AudioTypeId.Equals(audioTypeInt));
			}

			// Sort the audio items based on the minimum audio duration
			if (!String.IsNullOrWhiteSpace(audioMinDuration))
			{
				int audioMinDurationInt = Int32.Parse(audioMinDuration);
				audio = audio.Where(r => r.AudioDuration >= audioMinDurationInt);
			}

			// Sort the audio items based on the maximum audio duration
			if (!String.IsNullOrWhiteSpace(audioMaxDuration))
			{
				int audioMaxDurationInt = Int32.Parse(audioMaxDuration);
				audio = audio.Where(r => r.AudioDuration <= audioMaxDurationInt);
			}

			// Sort the audio items based on the release year
			if (!String.IsNullOrWhiteSpace(audioYear))
			{
				int audioYearInt = Int32.Parse(audioYear);
				audio = audio.Where(r => r.AudioReleaseYear.Equals(audioYearInt));
			}

			// Sort the audio items based on the user input
			switch (sortOrder)
			{
				case "artist_name":
					audio = audio.OrderBy(r => r.ArtistName);
					break;
				case "artist_name_desc":
					audio = audio.OrderByDescending(r => r.ArtistName);
					break;
				case "audio_title":
					audio = audio.OrderBy(r => r.AudioTitle);
					break;
				case "audio_title_desc":
					audio = audio.OrderByDescending(r => r.AudioTitle);
					break;
				case "audio_duration":
					audio = audio.OrderBy(r => r.AudioDuration);
					break;
				case "audio_duration_desc":
					audio = audio.OrderByDescending(r => r.AudioDuration);
					break; 
				default:
					audio = audio.OrderBy(r => r.ArtistName);
					break;
			}

			ViewBag.AudioCount = audio.Count();

			int pageSize = 1;
			int pageNumber = (page ?? 1);
            return View(audio.ToPagedList(pageNumber, pageSize));
        }

		[HttpPost]
		public ActionResult AddNewAudioItem()
		{
			return Json("", JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		public ActionResult UpdateAudioItem()
		{
			return Json("", JsonRequestBehavior.AllowGet);
		}

	}
}