using Microsoft.AspNet.Identity;
using RadioPlayout.Models;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace RadioPlayout.Controllers
{
	[Authorize]
    public class RadioPlayerController : Controller
    {
		private ApplicationDbContext _db = new ApplicationDbContext();

        // GET: RadioPlayer
        public ActionResult Index()
        {
			// Get user details
			string currentUserId = User.Identity.GetUserId();
			ApplicationUser currentUser = _db.Users.FirstOrDefault(x => x.Id == currentUserId);
			ViewBag.UserName = currentUser.FirstName + " " + currentUser.LastName;

			var scheduleClock = _db.ScheduleClock.ToList();

			return View(scheduleClock);
        }

		/// <summary>
		/// Filter the Audio database based on inputs from the user
		/// </summary>
		/// <param name="audioSearch">An artist name to search for. E.g. "Olly Murs"</param>
		/// <param name="audioType">An audio type to search for. E.g "Jingle"</param>
		/// <param name="audioMinDuration">The minimum seconds of a song duration to search for. E.g. "100"</param>
		/// <param name="audioMaxDuration">The maximum seconds of a song duration to search for. E.g. "500"</param>
		/// <param name="audioYear">The audio year to search for. E.g. "90s"</param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult FilterAudioCatalogue(string audioSearch, string audioType, string audioMinDuration, string audioMaxDuration, string audioYear)
		{
			// Check audioType has a value and convert it to an integer
			int audioTypeInt = 0;
			if (!String.IsNullOrWhiteSpace(audioType))
			{
				audioTypeInt = Int32.Parse(audioType);
			}
			// Check audioMinDuration has a value and convert it to an integer
			int audioMinDurationInt = 0;
			if (!String.IsNullOrWhiteSpace(audioMinDuration))
			{
				audioMinDurationInt = Int32.Parse(audioMinDuration);
			}
			// Check audioMaxDuration has a value and convert it to an integer
			int audioMaxDurationInt = 0;
			if (!String.IsNullOrWhiteSpace(audioMaxDuration))
			{
				audioMaxDurationInt = Int32.Parse(audioMaxDuration);
			}
			// Check audioYear has a value and convert it to an integer
			int audioYearInt = 0;
			if (!String.IsNullOrWhiteSpace(audioYear))
			{
				audioYearInt = Int32.Parse(audioYear);
			}

			// Filter the Audio DB based on the filter values supplied by the user
			var audio = _db.Audio
						.Where(r => audioSearch == null || r.ArtistName.StartsWith(audioSearch))
						.Where(r => audioTypeInt == 0 || r.AudioType.AudioTypeId.Equals(audioTypeInt))
						.Where(r => audioYearInt == 0 || r.AudioReleaseYear.Equals(audioYearInt))
						.Where(r => audioMinDurationInt == 0 || r.AudioDuration >= audioMinDurationInt)
						.Where(r => audioMaxDurationInt == 0 || r.AudioDuration <= audioMaxDurationInt);

			return Json(audio, JsonRequestBehavior.AllowGet);
		}
		
		/// <summary>
		/// Get the track info from the Audio DB based on an AudioId
		/// </summary>
		/// <param name="audioId">The AudioId of the audio item from the database</param>
		/// <returns>A JSON object with the Audio data</returns>
		[HttpPost]
		public ActionResult GetTrackInfo(string audioId)
		{
			// Check whether the audioId has a value and convert it to an integer
			int audioIdInt = 0;
			if(audioId != null)
			{
				audioIdInt = Int32.Parse(audioId.Trim());
			}

			// Search the Audio DB for the audio item based on the audioId
			var audio = _db.Audio.Where(r => r.AudioId.Equals(audioIdInt));

			return Json(audio, JsonRequestBehavior.AllowGet);
		}

		protected override void Dispose(bool disposing)
		{
			if (_db != null)
			{
				_db.Dispose();
			}
		}
	}
}