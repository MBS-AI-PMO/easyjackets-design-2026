// People -> Subscribers (admin only): the newsletter list the storefront's footer form fills.
import NewsletterSubscriber from '../models/newsletterSubscriberModel.js';

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /features/subscribers?status=subscribed|unsubscribed&search=text
export const listSubscribers = async (req, res) => {
    try {
        const { status, search } = req.query;
        const filter = {};
        if (status === 'subscribed' || status === 'unsubscribed') filter.status = status;
        if (search && String(search).trim()) filter.email = { $regex: escapeRegex(String(search).trim()), $options: 'i' };
        const [subscribers, total, active] = await Promise.all([
            NewsletterSubscriber.find(filter).sort({ subscribedAt: -1 }).lean(),
            NewsletterSubscriber.countDocuments({}),
            NewsletterSubscriber.countDocuments({ status: 'subscribed' }),
        ]);
        res.status(200).json({ success: true, subscribers, counts: { total, subscribed: active, unsubscribed: total - active } });
    } catch (error) {
        console.error('listSubscribers failed:', error);
        res.status(500).json({ success: false, message: 'Could not load subscribers' });
    }
};

// PUT /features/subscribers/:id  { status: 'subscribed' | 'unsubscribed' }
export const updateSubscriber = async (req, res) => {
    try {
        const { status } = req.body || {};
        if (status !== 'subscribed' && status !== 'unsubscribed') {
            return res.status(400).json({ success: false, message: 'Status must be subscribed or unsubscribed.' });
        }
        const update = status === 'subscribed'
            ? { status, subscribedAt: new Date(), unsubscribedAt: null }
            : { status, unsubscribedAt: new Date() };
        const subscriber = await NewsletterSubscriber.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
        if (!subscriber) return res.status(404).json({ success: false, message: 'Subscriber not found' });
        res.status(200).json({ success: true, subscriber });
    } catch (error) {
        console.error('updateSubscriber failed:', error);
        res.status(500).json({ success: false, message: 'Could not update the subscriber' });
    }
};

// DELETE /features/subscribers/:id  (removes the address from the list for good)
export const deleteSubscriber = async (req, res) => {
    try {
        const removed = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
        if (!removed) return res.status(404).json({ success: false, message: 'Subscriber not found' });
        res.status(200).json({ success: true, message: 'Subscriber removed' });
    } catch (error) {
        console.error('deleteSubscriber failed:', error);
        res.status(500).json({ success: false, message: 'Could not remove the subscriber' });
    }
};
