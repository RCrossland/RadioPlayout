using RadioPlayout.Models;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace RadioPlayout.Controllers
{
    public class RadioPlayerController : Controller
    {
		RadioPlayoutDb _db = new RadioPlayoutDb();

        // GET: RadioPlayer
        public ActionResult Index()
        {
			dynamic model = new ExpandoObject();

			model.ScheduleItems = from scheduleItem in _db.ScheduleItems
								  where scheduleItem.Schedule.ScheduleId == 1
								  select scheduleItem;

			model.Audio = _db.Audio.ToList();

			return View(model);
        }
		
		[HttpPost]
		public ActionResult FilterAudioCatalogue(string audioSearch, string audioType, string audioMinDuration, string audioMaxDuration, string audioYear)
		{
			int audioTypeInt = 0;
			if (!String.IsNullOrWhiteSpace(audioType))
			{
				audioTypeInt = Int32.Parse(audioType);
			}

			int audioMinDurationInt = 0;
			if (!String.IsNullOrWhiteSpace(audioMinDuration))
			{
				audioMinDurationInt = Int32.Parse(audioMinDuration);
			}

			int audioMaxDurationInt = 0;
			if (!String.IsNullOrWhiteSpace(audioMaxDuration))
			{
				audioMaxDurationInt = Int32.Parse(audioMaxDuration);
			}

			int audioYearInt = 0;
			if (!String.IsNullOrWhiteSpace(audioYear))
			{
				audioYearInt = Int32.Parse(audioYear);
			}

			var audio = _db.Audio
						.Where(r => audioSearch == null || r.ArtistName.StartsWith(audioSearch))
						.Where(r => audioTypeInt == 0 || r.AudioType.AudioTypeId.Equals(audioTypeInt))
						.Where(r => audioYearInt == 0 || r.AudioReleaseYear.Equals(audioYearInt))
						.Where(r => audioMinDurationInt == 0 || r.AudioDuration >= audioMinDurationInt)
						.Where(r => audioMaxDurationInt == 0 || r.AudioDuration <= audioMaxDurationInt);

			return Json(audio, JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		public ActionResult GetTrackInfo(string audioId)
		{
			int audioIdInt = 0;
			if(audioId != null)
			{
				audioIdInt = Int32.Parse(audioId.Trim());
			}

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